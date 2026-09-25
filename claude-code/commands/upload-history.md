---
description: Upload locally captured history to your fancysauce account
---

Run `bash "${CLAUDE_PLUGIN_ROOT}/bin/fancysauce" upload-history` via the Bash tool, or `& "$env:CLAUDE_PLUGIN_ROOT\bin\windows-amd64\fancysauce.exe" upload-history` where PowerShell is the registered shell, passing through any args the user provided. Surface its stderr/stdout verbatim.

Args the binary supports:
- (no args) — spawn the background runner; return immediately with a brief acknowledgment.
- `--status` — print the current backfill status (running / completed / failed / interrupted / absent).
- `--skip` — write a marker that suppresses future backfill nudges. Does not stop a running backfill.
- `--scan` — one-shot, idempotent scan of historical subagent transcripts (recovers sessions finished before this plugin's subagent-transcript discovery fix shipped); enqueues any missed events, prints a summary, then spawns the runner exactly like the no-flag path.

If the user has not signed in (no credential file), the binary will print an error pointing at `/fancysauce-savings-preview:login`.
