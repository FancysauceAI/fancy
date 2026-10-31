# FancySauce Savings

Usage analytics for Claude Code and OpenAI Codex CLI.

**Version:** 0.23.0

This repo is the canonical distribution for both the Claude Code plugin and the
OpenAI Codex plugin. Each tool installs only its own plugin.

## What this build ships

This is the hooks-only preview channel. It carries the cross-compiled Go
collector at `bin/fancysauce`, the hook declarations that call it, and the
slash commands
`/setup`,
`/upload-history` and
`/reset`, which run that same binary — no skills, no statusline and no
MCP server.
**No Node runtime is required** — capture is one static binary per platform.

**Windows machines need Git Bash on `PATH`.** The hook command is
`bash "${CLAUDE_PLUGIN_ROOT}/bin/fancysauce" collect --agent claude-code`
(`--agent codex` in Codex), and without a `bash` the hook fails and nothing is
captured. Git for Windows supplies one.

**Where PowerShell is Claude Code's registered shell**, the commands run
`& "$env:CLAUDE_PLUGIN_ROOT\bin\windows-amd64\fancysauce.exe" setup` directly, and
likewise for the other commands.

### What leaves the machine

Usage metadata only — session, tool-call and request analytics — sent to the
Fancysauce ingest endpoint this build was published against and readable in
your Fancysauce dashboard. Never the contents of your prompts, files or model
responses; every field that can leave a machine is listed in
[docs/data-contract.md](docs/data-contract.md). Every event reports which
collector produced it as the `fancysauce.runtime` resource attribute.

### Uninstalling

Capture stops as soon as the plugin is uninstalled:

```
claude plugin uninstall fancysauce-savings-preview@fancy
```

In Codex, remove the plugin through that CLI's own plugin commands. Neither
uninstall deletes what is already on disk — the collector's data directory and
the per-machine credential file stay until you remove them.

## Claude Code
To install and setup the plugin in Claude Code:
```
/plugin marketplace add FancysauceAI/fancy
/plugin install fancysauce-savings-preview@fancy
/reload-plugins
/setup
```

## OpenAI Codex
To install and setup the plugin in Codex:
```
codex plugin marketplace add FancysauceAI/fancy
```


## Claude Code started by Codex in a sandbox

Codex can run `claude` as a tool command. Its `workspace-write` sandbox denies
writes under `~/.claude`, so the plugin does not capture that Claude Code
session:

- Claude Code cannot create `~/.claude/session-env/<session>`, so it runs no
  `SessionStart` hook.
- Claude Code cannot write its transcript in `~/.claude/projects`, so the
  plugin cannot read the API requests of the session.
- The plugin cannot write its data directory in `~/.claude/plugins/data`.

Do not make `~/.claude` paths writable for the sandbox. Claude Code runs
files from these paths outside the sandbox. It sources the files in
`~/.claude/session-env` before each Bash command. It runs the plugin binaries
in `~/.claude/plugins/data`. A sandboxed command that writes there can run code
outside the sandbox.

To capture a Claude Code session that Codex starts, run that `claude` command
outside the sandbox. For example, approve it to run unsandboxed.


## Enterprise / MDM deployment

Deploying to a managed fleet? [`mdm/`](mdm/) has the full IT-admin guides:
[Jamf Pro](mdm/jamf/README.md), [Kandji](mdm/kandji/README.md), and
[Microsoft Intune](mdm/intune/README.md), plus an
[MDM-agnostic contract](mdm/README.md) you can adapt to any tool. They cover
system-wide managed settings for Claude Code, the auto-trusted managed-hook
path for Codex, and the per-user credential file both tools read.


## Privacy

The plugin forwards usage metadata (session, tool-call, and request analytics)
to your Fancysauce dashboard. It does not transmit the contents of your prompts,
files, or model responses. Every field that can leave a machine is listed in
[docs/data-contract.md](docs/data-contract.md), generated from the plugin's own
content filter; [docs/ingest-token.md](docs/ingest-token.md) describes the
write-only token the plugin authenticates with.

To attribute that usage to a person, the plugin resolves one identifier for the
developer. It prefers an identifier you supplied — the account you signed in
with, or one your administrator set through an MDM profile. If none is present,
it falls back to an email the machine already holds: your Claude or Codex
account email, the email in your macOS directory record (`dscl`), your Windows
user principal name (`whoami /upn`), or your git `user.email`. That value is
encrypted to the Fancysauce public key before it leaves your machine, is
readable only by the identity-anchoring job on the server, and is never sent
in plain text.
