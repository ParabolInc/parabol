// this is just to get typescript to stop complaining about imports
// declare module '*'
declare module '*.png'

declare module '*.svg'

declare module '*.graphql' {
  const value: string
  export = value
}

declare const __PRODUCTION__: string
declare const __SOCKET_PORT__: string
declare const __webpack_public_path__: string

interface Window {
  __ACTION__: {
    atlassian: string
    logRocket: string | undefined
    github: string
    google: string
    segment: string
    sentry: string
    slack: string
    stripe: string
    prblIn: string
  }
}

declare namespace NodeJS {
  interface Global {
    hmrMiddleware: any
    hmrSchema: any
  }
  interface NodeModule {
    hot: any
  }
}

interface HotMod extends NodeJS.Module {
  hot: {
    accept: any
  }
}

declare let module: HotMod
declare type Json = null | boolean | number | string | Json[] | {[key: string]: Json}
