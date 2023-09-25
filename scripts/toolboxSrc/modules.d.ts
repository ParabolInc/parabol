declare module '*.png' {
  const value: string
  export = value
}

declare module '*/getProjectRoot' {
  const value: () => string
  export = value
}

declare const __APP_VERSION__: string
declare const __COMMIT_HASH__: string
