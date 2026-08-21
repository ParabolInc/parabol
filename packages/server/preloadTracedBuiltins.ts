/*
 * Must be the first module in every server bundle.
 *
 * dd-trace registers its instrumentation the moment it is imported (bundler-register), and it does
 * so with a bundled copy of require-in-the-middle whose `require.cache` lookup webpack rewrites to
 * webpack's own module cache. Node never puts core modules in `require.cache`, so an unbundled
 * dd-trace never takes that branch, but the bundled copy does: once RITM has cached a core module
 * -- which happens as soon as unbundled code (pg, ws) requires it -- the webpack external for that
 * module is handed webpack's placeholder instead of the real module, and it keeps it forever. Every
 * bundled consumer then gets `{}`: an empty `net` surfaces as `net.Socket is not a constructor`
 * from pg and `net_1.createConnection is not a function` from ioredis.
 *
 * Resolving the externals before dd-trace is imported keeps webpack and Node on the same object.
 * Only the core modules dd-trace hooks are at risk.
 */
import 'child_process'
import 'crypto'
import 'dns'
import 'fs'
import 'http'
import 'https'
import 'net'
import 'node:crypto'
import 'node:dns'
import 'node:http'
import 'node:https'
import 'node:net'
import 'node:url'
import 'url'
import 'vm'
