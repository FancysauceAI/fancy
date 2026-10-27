// The plugin data dir Claude Code hands hooks as CLAUDE_PLUGIN_DATA, derived
// from the install's cache path, because a module sees neither variable:
// <config>/plugins/cache/<marketplace>/<plugin>/<version> ->
// <config>/plugins/data/<plugin>-<marketplace>/state/usage-relay
export function relayDir(pluginRoot: string): string | undefined {
  const sep = pluginRoot.includes('\\') ? '\\' : '/'
  // Kept whole: a UNC root's leading `\\` collapsed to one names a different path.
  const lead = /^[\\/]*/.exec(pluginRoot)?.[0] ?? ''
  const parts = pluginRoot.slice(lead.length).split(/[\\/]+/)
  while (parts.length > 0 && parts[parts.length - 1] === '') parts.pop()
  const n = parts.length
  if (n < 6 || parts[n - 5] !== 'plugins' || parts[n - 4] !== 'cache') return undefined
  const marketplace = parts[n - 3]
  const plugin = parts[n - 2]
  return lead + [...parts.slice(0, n - 4), 'data', `${plugin}-${marketplace}`, 'state', 'usage-relay'].join(sep)
}

// One file per reading, named apart by its millisecond and its session. The
// collector waits out a file it cannot parse, which may still be mid-write.
export function readingFileName(observedAtMs: number, sessionId: string): string {
  return `${observedAtMs}-${sessionId.replace(/[^A-Za-z0-9]/g, '').slice(0, 8)}.json`
}
