// Relays the session's live rate-limit windows to the collector through files
// in the plugin data dir. An add-on: every failure is swallowed, nothing is
// shown, and a session that never loads this module loses nothing else.
//
// Claude Code's static check requires every engine call spelled $.noun.method
// at its call site, so the two hooks repeat the write rather than share a
// helper that takes $.
import type { Register } from 'claude-code'
import { readingFileName, relayDir } from './usage-relay-path.ts'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    try {
      const dir = relayDir($.plugin.root)
      const usage = await $.session.usage()
      if (dir !== undefined && usage.rateLimits.length > 0) {
        const observedAtMs = await $.clock.now()
        const sessionId = await $.session.id()
        const reading = { v: 1, observedAtMs, sessionId, trigger: 'session.start', rateLimits: usage.rateLimits }
        await $.fs.write(`${dir}/${readingFileName(observedAtMs, sessionId)}`, JSON.stringify(reading))
      }
    } catch {
      // The add-on stays invisible; the collector's cache read still runs.
    }
    return result
  })

  on('session.measure', async ($, e, next) => {
    try {
      const dir = relayDir($.plugin.root)
      if (dir !== undefined && e.changed.includes('rateLimits') && e.rateLimits.length > 0) {
        const observedAtMs = await $.clock.now()
        const sessionId = await $.session.id()
        const reading = { v: 1, observedAtMs, sessionId, trigger: 'session.measure', rateLimits: e.rateLimits }
        await $.fs.write(`${dir}/${readingFileName(observedAtMs, sessionId)}`, JSON.stringify(reading))
      }
    } catch {
      // As above.
    }
    return next(e)
  })
}
