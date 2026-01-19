# GitHub Actions Workflows

This directory contains the automated workflow for monitoring GitHub Actions.

## monitor-workflows.yml

Automatically monitors configured repositories and generates an HTML dashboard.

**Schedule**: Runs every hour (configurable)

**Manual trigger**: Can be triggered manually from Actions tab

**What it does**:
1. Checks out the repository
2. Installs Node.js dependencies
3. Runs the monitoring script
4. Generates HTML dashboard from template
5. Commits the updated dashboard
6. Uploads results as artifacts
7. Reports on any failures

**Required secrets**:
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

**Outputs**:
- `workflow-results.json` - Raw workflow data
- `dashboard.html` - Interactive dashboard
- Workflow artifact with results
