# Workflow Monitoring Dashboard

A comprehensive GitHub Actions workflow monitoring solution that tracks multiple repositories and generates interactive HTML dashboards with real-time filtering and sorting capabilities.

## Features

- 🔍 **Multi-Repository Monitoring** - Monitor workflows across multiple GitHub repositories
- 📊 **Interactive Dashboard** - Beautiful HTML dashboard with sorting and filtering
- 🎯 **Smart Filtering** - Text-based repo filter and status dropdown
- 📈 **Status Tracking** - Track success, failure, and in-progress workflows
- ⚡ **Real-time Updates** - Automated scheduling via GitHub Actions
- 🎨 **Clean UI** - Minimalist table design with color-coded statuses

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

2. **Set GitHub Token:**

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
- Generate `workflow-results.json` with raw data
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
   - Run hourly (configurable via cron schedule)
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

### Sorting

Click column headers to sort by:
- **Repo**: Alphabetical order
- **Workflow**: Alphabetical order  
- **Last Run**: Date ascending/descending

Visual indicators show current sort direction (↑ ↓)

### Status Display

- ✅ **Success** - Green color
- ❌ **Failure** - Red color
- 🔄 **In Progress** - Blue color
- ⚠️ **Error** - Gray color

## File Structure

```
workflow-monitoring-dashboard/
├── .github/
│   └── workflows/
│       └── monitor-workflows.yml    # GitHub Actions workflow
├── scripts/
│   └── monitor-workflows.ts         # Monitoring script
├── templates/
│   └── dashboard-template.html      # Dashboard HTML template
├── monitor-config.yml               # Repository configuration
├── package.json                     # Node.js dependencies
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

## Configuration Options

### Monitor Config (`monitor-config.yml`)

```yaml
repositories:
  - owner: string          # GitHub organization/user
    repo: string           # Repository name
    workflows:
      - name: string       # Workflow filename (e.g., "build.yml")
        branch: string     # Branch to monitor (default: "main")
        event: string      # Event type (push/schedule/etc, default: "schedule")
```

### GitHub Actions Workflow

Customize the schedule in `.github/workflows/monitor-workflows.yml`:

```yaml
on:
  schedule:
    - cron: '0 * * * *'  # Runs every hour
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

### `workflow-results.json`
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
- Deployed to any static hosting service

## Deployment Options

### GitHub Pages

1. Enable GitHub Pages in repository settings
2. Set source to root or /docs folder
3. The workflow will automatically update `dashboard.html`
4. Access at `https://your-username.github.io/workflow-monitoring-dashboard/`

### Alternative Hosting

The `dashboard.html` file is completely self-contained and can be hosted anywhere:
- Netlify
- Vercel
- AWS S3
- Azure Static Web Apps

## API Rate Limits

- **Without token**: 60 requests/hour
- **With token**: 5,000 requests/hour

The script includes automatic delays to avoid rate limiting.

## Troubleshooting

### "No runs found"
- Check that the workflow file name is correct
- Verify the branch name matches
- Ensure workflows have run at least once

### Rate limiting
- Add `GITHUB_TOKEN` environment variable
- Reduce monitoring frequency
- Monitor fewer repositories

### Template not found
- Ensure `templates/dashboard-template.html` exists
- Check file paths are relative to project root

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use this in your projects!

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review GitHub Actions logs for errors

---

**Made with ❤️ for monitoring GitHub Actions workflows**
