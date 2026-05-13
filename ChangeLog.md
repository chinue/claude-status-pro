# Change Log

All notable changes to the `claude-status-pro` extension.

## [Unreleased]

## [0.1.0] - 2026-05-13

### Added
- **Initial release** — Forked from `kimi-status-pro` v0.2.20 and ported to Claude Code.
- **Claude Code authentication** — Reads `~/.claude/.credentials.json` for OAuth tokens, with fallback to AWS Bedrock and Anthropic API Key environment variables.
- **Anthropic API rate-limit probe** — POST probe to `api.anthropic.com/v1/messages`, parses `anthropic-ratelimit-unified-*` response headers for 5h/7d utilization.
- **Local JSONL usage tracking** — Scans `~/.claude/projects/**/*.jsonl` for `type === 'assistant'` entries, aggregates tokens and costs.
- **Multi-model pricing** — Supports Claude Opus ($5/$25), Sonnet ($3/$15), and Haiku ($1/$5) with configurable per-model USD pricing.
- **Dashboard** — Real-time usage dashboard with cost curves, heatmaps, and model breakdown (USD currency).
- **StatusBar** — Live utilization display with Claude ✴️ icon and 5-segment color scale.
