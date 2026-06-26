# localLLMapp
an app made entirely with local LLM

## GitHub Actions Workflows

### Opencode Workflow
The repository includes a GitHub Actions workflow (`.github/workflows/opencode.yml`) that triggers on issue and pull request review comments containing the `/oc` or `/opencode` commands.

**Setup Requirements:**
- **Self-Hosted Runner:** The workflow runs on a `self-hosted` runner. Ensure your runner environment is configured and compatible with the `anomalyco/opencode/github@latest` action. Authentication is handled via the runner's local opencode configuration; the workflow no longer requires a hardcoded API key.
