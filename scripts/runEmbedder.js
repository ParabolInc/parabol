/**
  Starts up an instance of the stateless Embedder service.
  When you modify a server file, the webpack watcher in
  {@link buildServers} writes the change to {@link ../dev/embedder}.
  Pm2 reloads this file whenever {@link embedder} changes
*/

try {
  require('../dev/embedder.js')
} catch (e) {
  // webpack has not created the file yet
  // pm2 will restart this process when the file changes
}
