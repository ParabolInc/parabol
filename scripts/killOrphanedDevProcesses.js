/*
  pm2 does not reap its children when the daemon itself dies (a Ctrl-C on `pm2 --no-daemon`
  leaves them running and the OS reparents them to init). The next `pnpm dev` starts a daemon
  that knows nothing about them, so they keep their ports: uWS binds with SO_REUSEPORT, which
  lets an orphaned socket server keep serving stale bundles alongside the live one while the
  kernel round-robins between them. Sweep them before pm2 boots the new stack.

  Only processes reparented to init are killed, so a second `pnpm dev` running in another
  terminal keeps its own children (they still belong to a live daemon)
*/
const cp = require('child_process')

const DEV_SCRIPTS = [
  'scripts/runSocketServer.js',
  'scripts/runEmbedder.js',
  'scripts/buildServers.js',
  'scripts/hmrServer.js',
  'scripts/relayWatch.js'
]

const getOrphans = (pattern) => {
  let pids = []
  try {
    // execFileSync avoids a shell, so no `sh -c` process matches our own pattern
    pids = cp
      .execFileSync('pgrep', ['-f', pattern], {encoding: 'utf8'})
      .split('\n')
      .map((pid) => Number(pid.trim()))
      .filter((pid) => pid && pid !== process.pid)
  } catch {
    // pgrep exits 1 when nothing matches
    return []
  }
  if (pids.length === 0) return []
  try {
    return cp
      .execFileSync('ps', ['-o', 'pid=,ppid=', '-p', pids.join(',')], {encoding: 'utf8'})
      .split('\n')
      .map((line) => line.trim().split(/\s+/).map(Number))
      .filter(([pid, ppid]) => pid && ppid === 1)
      .map(([pid]) => pid)
  } catch {
    // every match exited between the pgrep and the ps
    return []
  }
}

const killOrphanedDevProcesses = () => {
  const orphans = [...new Set(DEV_SCRIPTS.flatMap(getOrphans))]
  orphans.forEach((pid) => {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      // already gone
    }
  })
  if (orphans.length > 0) {
    console.log(`Killed ${orphans.length} orphaned dev process(es): ${orphans.join(', ')}`)
  }
}

module.exports = killOrphanedDevProcesses
