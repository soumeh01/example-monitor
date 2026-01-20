# Workflow Monitoring Dashboard

A comprehensive GitHub Actions workflow monitoring solution that tracks multiple
repositories and generates HTML dashboards.

## Features

- 🔍 **Multi-Repository Monitoring** - Monitor workflows across multiple GitHub repositories
- 📊 **Interactive Dashboard** - HTML dashboard with sorting and filtering
- 📈 **Status Tracking** - Track success, failure, and in-progress workflows
- ⚡ **Real-time Updates** - Automated scheduling via GitHub Actions

## Quick Start

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Configuration

- **Create or edit `monitor-config.yml`:**

```yaml
repositories:
  - owner: your-org
    repo: your-repo
    workflows:
      - name: build.yml
        branch: main
        event: push
      
  - owner: another-org
    repo: another-repo
    workflows:
      - name: test.yml
        branch: main
        event: schedule
```

- **Set GitHub Token:**

```bash
export GITHUB_TOKEN=your_github_token_here
```

### Local Usage

Run the monitoring script locally:

```bash
npm run monitor
```

This will:

- Fetch workflow status from configured repositories
- Generate `results.json` with raw data
- Create `dashboard.html` with interactive dashboard
- Display summary statistics in terminal

### Status Display

- ✅ **Success**
- ❌ **Failure**
- 🔄 **In Progress**
- ⚠️ **Error**

## Configuration Options

### Monitor Config (`monitor-config.yml`)

```yaml
repositories:
  - owner: string          # GitHub organization/user
    repo: string           # Repository name
    workflows:
      - name: string       # Workflow filename (e.g., "build.yml")
```

## Command Line Options

```bash
# Custom config file
npm run monitor -- --config path/to/config.yml

# Custom output path
npm run monitor -- --output path/to/output.json

# Custom GitHub token
npm run monitor -- --token ghp_yourtoken

# Help
npm run monitor -- --help
```

## Output Files

### `results.json`

Raw JSON data with workflow details:

```json
[
  {
    "owner": "org-name",
    "repo": "repo-name",
    "workflow": "build.yml",
    "branch": "main",
    "event": "push",
    "status": "completed",
    "conclusion": "success",
    "run_started_at": "2026-01-19T10:00:00Z",
    "html_url": "https://github.com/...",
    "run_number": "123"
  }
]
```

### `dashboard.html`

Interactive HTML dashboard that can be:

- Opened locally in a browser
- [GitHub Pages](https://soumeh01.github.io/example-monitor/dashboard.html)

## License

MIT License - feel free to use this in your projects!
