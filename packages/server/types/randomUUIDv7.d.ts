// node:crypto gained randomUUIDv7 in Node 24, which package.json's engines field already requires
// (^24.19.0) and CI installs via node-version-file. @types/node here is still pinned to ^22, so the
// declaration is missing even though the runtime has it. Declare it rather than casting at the call
// site; delete this file once @types/node is bumped to ^24.
declare module 'crypto' {
  /** Generates a time-ordered RFC 9562 UUIDv7, so new ids append to an index instead of scattering */
  function randomUUIDv7(): string
}
