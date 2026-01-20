# Workflow Monitoring Dashboard

A comprehensive GitHub Actions workflow monitoring solution that tracks multiple
repositories and generates HTML dashboards.

## Features

- 🔍 **Multi-Repository Monitoring** - Monitor workflows across multiple GitHub repositories
- 📊 **Interactive Dashboard** - Beautiful HTML dashboard with sorting and filtering
- 📈 **Status Tracking** - Track success, failure, and in-progress workflows
- ⚡ **Real-time Updates** - Automated scheduling via GitHub Actions

## Quick Start

### Prerequisites

- Node.js 18+
- GitHub Personal Access Token (for API access)

### Installation

```bash
npm install
```

### Configuration

1. **Create or edit `monitor-config.yml`:**

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

1. **Set GitHub Token:**

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

### GitHub Actions Setup

The repository includes a pre-configured workflow that runs automatically:

1. **Fork/Clone this repository**

2. **Add your GitHub token as a repository secret:**
   - Go to Settings → Secrets and variables → Actions
   - Add `GITHUB_TOKEN` secret

3. **Enable GitHub Actions:**
   - Go to Actions tab
   - Enable workflows

4. **The workflow will:**
   - Run weekly once (configurable via cron schedule)
   - Generate and commit `dashboard.html`
   - Upload results as artifacts
   - Alert on failures

## Dashboard Features

### Filtering

- **Repo Filter**: Text input with partial matching (case-insensitive)
  - Type "arm" to show all repos containing "arm"
  - Matches anywhere in the repo name

- **Status Filter**: Dropdown with predefined options
  - All / Success / Failure / In Progress

Visual indicators show current sort direction (↑ ↓)

### Status Display

- ✅ **Success** - Green color
- ❌ **Failure** - Red color
- 🔄 **In Progress** - Blue color
- ⚠️ **Error** - Gray color

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
- Hosted on GitHub Pages

## API Rate Limits

- **Without token**: 60 requests/hour
- **With token**: 5,000 requests/hour

The script includes automatic delays to avoid rate limiting.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use this in your projects!
