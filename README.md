# localLLMapp
an app made entirely with local LLM

## GitHub Actions Workflows

### Opencode Workflow
The repository includes a GitHub Actions workflow (`.github/workflows/opencode.yml`) that triggers on issue and pull request review comments containing the `/oc` or `/opencode` commands.

**Setup Requirements:**
- **Self-Hosted Runner:** The workflow runs on a `self-hosted` runner. Ensure your runner environment is configured and compatible with the `anomalyco/opencode/github@latest` action.
- **Repository Secret:** You must manually add the `OMLX_API_KEY` secret to your repository settings (`Settings > Secrets and variables > Actions`) before the workflow can execute successfully.
