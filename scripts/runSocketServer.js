/**
  Starts up an instance of the stateless GraphQL Executor.
  When you modify a server file, the webpack watcher in
  {@link buildServers} writes the change to {@link ../dev/web}.
  Pm2 reloads this file whenever {@link ../dev/web} changes
*/
require('../dev/web.js')
