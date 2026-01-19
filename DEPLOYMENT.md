# Deployment Guide

## Push to GitHub

### 1. Create a New Repository on GitHub

Go to https://github.com/new and create a repository named:
- **Repository name**: `workflow-monitoring-dashboard`
- **Description**: GitHub Actions Workflow Monitoring Dashboard
- **Visibility**: Public (or Private if preferred)
- **Initialize**: Do NOT initialize with README, license, or .gitignore (we already have these)

### 2. Add Remote and Push

```bash
cd /c/Sandbox/forked/workflow-monitoring-dashboard

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/workflow-monitoring-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### 3. Configure GitHub Actions

After pushing, go to your repository settings:

1. **Enable GitHub Actions**
   - Go to Settings → Actions → General
   - Enable "Allow all actions and reusable workflows"

2. **Set up GitHub Token** (if monitoring private repos)
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GITHUB_TOKEN`
   - Value: Your GitHub Personal Access Token
   - Note: For public repos, the default `GITHUB_TOKEN` works automatically

3. **Configure Permissions**
   - Go to Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

### 4. Test the Workflow

1. Go to the Actions tab in your repository
2. Select "Monitor Workflows" workflow
3. Click "Run workflow" → "Run workflow"
4. Wait for it to complete
5. The `dashboard.html` will be automatically committed

### 5. Enable GitHub Pages (Optional)

To host the dashboard publicly:

1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `root`
4. Save

Your dashboard will be available at:
`https://YOUR_USERNAME.github.io/workflow-monitoring-dashboard/dashboard.html`

## Alternative: Use GitHub CLI

If you have GitHub CLI installed:

```bash
cd /c/Sandbox/forked/workflow-monitoring-dashboard

# Create repository and push in one command
gh repo create workflow-monitoring-dashboard --public --source=. --push

# Or for private repository
gh repo create workflow-monitoring-dashboard --private --source=. --push
```

## Update Configuration

After pushing, edit `monitor-config.yml` to add your repositories:

```yaml
repositories:
  - owner: your-org
    repo: your-repo
    workflows:
      - name: build.yml
        branch: main
        event: push
```

Commit and push the changes:

```bash
git add monitor-config.yml
git commit -m "Configure monitored repositories"
git push
```

The GitHub Action will automatically run on the next schedule or manual trigger.

## Troubleshooting

### Permission Denied
If you get permission errors when pushing:
- Ensure you have write access to the repository
- Use a Personal Access Token instead of password
- Check SSH keys are configured correctly

### Workflow Not Running
- Check Actions are enabled in repository settings
- Verify workflow file is in `.github/workflows/` directory
- Check for YAML syntax errors

### Dashboard Not Updating
- Verify workflow completed successfully in Actions tab
- Check workflow permissions allow writing to repository
- Look for error messages in workflow logs

---

**Need Help?** Check the main [README.md](README.md) for detailed documentation.
