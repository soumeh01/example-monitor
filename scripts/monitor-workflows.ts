#!/usr/bin/env node
/**
 * GitHub Workflow Monitor
 * 
 * This script monitors GitHub Actions workflows across multiple repositories
 * and generates a consolidated status report.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WorkflowConfig {
  name: string;
  branch: string;
  event: string;
}

interface RepoConfig {
  owner: string;
  repo: string;
  workflows: WorkflowConfig[];
}

interface MonitorConfig {
  repositories: RepoConfig[];
}

interface WorkflowRunResult {
  owner: string;
  repo: string;
  workflow: string;
  branch: string;
  event: string;
  timestamp: string;
  run_id?: string;
  run_number?: string;
  status: string;
  conclusion?: string;
  run_started_at?: string;
  html_url?: string;
  head_sha?: string;
  error?: string;
}

/**
 * Fetch workflow run status from GitHub API
 */
async function fetchWorkflowStatus(
  owner: string,
  repo: string,
  workflow: string,
  branch?: string,
  event?: string,
  token?: string
): Promise<any> {
  let url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/runs?per_page=1`;
  
  if (event) {
    url += `&event=${event}`;
  }
  
  if (branch) {
    url += `&branch=${branch}`;
  }

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'GitHub-Workflow-Monitor'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Process a single workflow and return its status
 */
async function processWorkflow(
  owner: string,
  repo: string,
  workflowConfig: WorkflowConfig,
  token?: string
): Promise<WorkflowRunResult> {
  const timestamp = new Date().toISOString();
  const baseResult = {
    owner,
    repo,
    workflow: workflowConfig.name,
    branch: workflowConfig.branch,
    event: workflowConfig.event,
    timestamp
  };

  try {
    console.log(`  Fetching ${workflowConfig.name}...`);
    
    const data = await fetchWorkflowStatus(
      owner,
      repo,
      workflowConfig.name,
      workflowConfig.branch,
      workflowConfig.event,
      token
    );

    if (data.message) {
      // API returned an error message
      return {
        ...baseResult,
        status: 'error',
        error: data.message
      };
    }

    if (!data.workflow_runs || data.workflow_runs.length === 0) {
      return {
        ...baseResult,
        status: 'no_runs_found'
      };
    }

    const run = data.workflow_runs[0];
    
    return {
      ...baseResult,
      run_id: run.id?.toString(),
      run_number: run.run_number?.toString(),
      status: run.status,
      conclusion: run.conclusion || 'n/a',
      run_started_at: run.run_started_at || run.created_at,
      html_url: run.html_url,
      head_sha: run.head_sha
    };
  } catch (error) {
    return {
      ...baseResult,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Simple YAML parser for our basic configuration structure
 */
function parseSimpleYaml(yamlContent: string): MonitorConfig {
  const lines = yamlContent.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#');
  });

  const repositories: RepoConfig[] = [];
  let currentRepo: RepoConfig | null = null;
  let currentWorkflows: WorkflowConfig[] = [];
  let inWorkflows = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const indent = line.search(/\S/);

    if (trimmed.startsWith('- owner:') || trimmed.startsWith('owner:')) {
      // Save previous repo if exists
      if (currentRepo && currentWorkflows.length > 0) {
        currentRepo.workflows = currentWorkflows;
        repositories.push(currentRepo);
      }
      
      const ownerMatch = trimmed.match(/owner:\s*(.+)/);
      currentRepo = {
        owner: ownerMatch ? ownerMatch[1].trim() : '',
        repo: '',
        workflows: []
      };
      currentWorkflows = [];
      inWorkflows = false;
    } else if (trimmed.startsWith('repo:') && currentRepo) {
      const repoMatch = trimmed.match(/repo:\s*(.+)/);
      currentRepo.repo = repoMatch ? repoMatch[1].trim() : '';
    } else if (trimmed === 'workflows:') {
      inWorkflows = true;
    } else if (inWorkflows && (trimmed.startsWith('- name:') || trimmed.startsWith('name:'))) {
      const nameMatch = trimmed.match(/name:\s*(.+)/);
      const workflow: WorkflowConfig = {
        name: nameMatch ? nameMatch[1].trim() : '',
        branch: 'main',  // Default branch
        event: 'schedule'  // Default event
      };
      currentWorkflows.push(workflow);
    } else if (inWorkflows && trimmed.startsWith('branch:') && currentWorkflows.length > 0) {
      const branchMatch = trimmed.match(/branch:\s*(.+)/);
      currentWorkflows[currentWorkflows.length - 1].branch = branchMatch ? branchMatch[1].trim() : 'main';
    } else if (inWorkflows && trimmed.startsWith('event:') && currentWorkflows.length > 0) {
      const eventMatch = trimmed.match(/event:\s*(.+)/);
      currentWorkflows[currentWorkflows.length - 1].event = eventMatch ? eventMatch[1].trim() : 'schedule';
    }
  }

  // Don't forget the last repo
  if (currentRepo && currentWorkflows.length > 0) {
    currentRepo.workflows = currentWorkflows;
    repositories.push(currentRepo);
  }

  return { repositories };
}

/**
 * Apply defaults to configuration
 */
function applyDefaults(config: MonitorConfig): MonitorConfig {
  for (const repo of config.repositories) {
    for (const workflow of repo.workflows) {
      if (!workflow.branch) {
        workflow.branch = 'main';
      }
      if (!workflow.event) {
        workflow.event = 'schedule';
      }
    }
  }
  return config;
}

/**
 * Monitor all workflows defined in the configuration
 */
async function monitorWorkflows(configPath: string, token?: string): Promise<WorkflowRunResult[]> {
  // Read configuration file
  const configContent = fs.readFileSync(configPath, 'utf-8');
  
  // Parse based on file extension
  let config: MonitorConfig;
  if (configPath.endsWith('.yml') || configPath.endsWith('.yaml')) {
    // Simple YAML parser for our basic structure
    config = parseSimpleYaml(configContent);
  } else {
    config = JSON.parse(configContent);
    // Apply defaults for JSON configs too
    config = applyDefaults(config);
  }

  const results: WorkflowRunResult[] = [];

  console.log(`Monitoring ${config.repositories.length} repositories...`);

  for (const repoConfig of config.repositories) {
    console.log(`\nProcessing ${repoConfig.owner}/${repoConfig.repo}...`);
    
    for (const workflowConfig of repoConfig.workflows) {
      const result = await processWorkflow(
        repoConfig.owner,
        repoConfig.repo,
        workflowConfig,
        token
      );
      
      results.push(result);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Generate HTML dashboard
 */
function generateHtmlDashboard(results: WorkflowRunResult[], outputPath: string): void {
  // Read template file
  const templatePath = path.join(__dirname, '..', 'templates', 'dashboard-template.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  
  // Replace DATA_PLACEHOLDER with actual JSON data
  const html = template.replace('DATA_PLACEHOLDER', JSON.stringify(results));
  
  fs.writeFileSync(outputPath, html);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  let configPath = path.join(process.cwd(), 'monitor-config.yml');
  let outputPath = path.join(process.cwd(), 'results.json');
  let token = process.env.GITHUB_TOKEN;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      configPath = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === '--token' && args[i + 1]) {
      token = args[i + 1];
      i++;
    } else if (args[i] === '--help') {
      console.log(`
GitHub Workflow Monitor

Usage: node monitor-workflows.js [options]

Options:
  --config <path>   Path to configuration file (default: monitor-config.yml)
  --output <path>   Path to output JSON file (default: results.json)
  --token <token>   GitHub API token (default: GITHUB_TOKEN env var)
  --help           Show this help message

Environment Variables:
  GITHUB_TOKEN     GitHub API token for authentication
      `);
      process.exit(0);
    }
  }

  // Verify config file exists
  if (!fs.existsSync(configPath)) {
    console.error(`Error: Configuration file not found: ${configPath}`);
    process.exit(1);
  }

  if (!token) {
    console.warn('Warning: No GitHub token provided. Rate limits will be restricted.');
    console.warn('Set GITHUB_TOKEN environment variable or use --token flag.');
  }

  try {
    // Monitor workflows
    const results = await monitorWorkflows(configPath, token);

    // Save results to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n✅ Results saved to: ${outputPath}`);

    // Generate HTML dashboard
    const htmlPath = path.join(path.dirname(outputPath), 'dashboard.html');
    generateHtmlDashboard(results, htmlPath);
    console.log(`✅ Dashboard saved to: ${htmlPath}`);

    // Calculate statistics
    const total = results.length;
    const success = results.filter(r => r.conclusion === 'success').length;
    const failure = results.filter(r => r.conclusion === 'failure').length;
    const inProgress = results.filter(r => r.status === 'in_progress').length;
    const errors = results.filter(r => r.status === 'error').length;

    // List errors first if found
    const errorWorkflows = results.filter(r => r.status === 'error');
    if (errorWorkflows.length > 0) {
      console.log('\n⚠️  Errors Encountered:');
      console.log('─────────────────────────────────────────────────────────────────');
      for (const result of errorWorkflows) {
        console.log(`   • ${result.owner}/${result.repo} (${result.workflow})`);
        console.log(`     Error: ${result.error}`);
        console.log('');
      }
    }

    // List failed workflows second if found
    const failedWorkflows = results.filter(r => r.conclusion === 'failure');
    if (failedWorkflows.length > 0) {
      console.log('\n❌ Failed Workflows:');
      console.log('────────────────────');
      for (const result of failedWorkflows) {
        console.log(`   • ${result.owner}/${result.repo} (${result.workflow})`);
        if (result.html_url) {
          console.log(`     View: ${result.html_url}`);
        }
        console.log('');
      }
    }

    // Print summary at the end
    console.log('📊 Summary Statistics:');
    console.log('──────────────────────');
    console.log(`   Total Workflows Monitored: ${total}`);
    console.log(`   ✅ Successful: ${success}`);
    console.log(`   ❌ Failed: ${failure}`);
    console.log(`   🔄 In Progress: ${inProgress}`);
    console.log(`   ⚠️  Errors: ${errors}`);

    // Exit with error code if any workflows failed
    const hasFailures = results.some(r => r.conclusion === 'failure');
    if (hasFailures) {
      process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if executed directly (always run for tsx)
main();

export { monitorWorkflows, processWorkflow, fetchWorkflowStatus };
