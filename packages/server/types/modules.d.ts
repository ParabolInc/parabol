// this is just to get typescript to stop complaining about imports
// declare module '*'
declare module '*.png' {
  const value: string
  export = value
}
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'

declare module '*.graphql' {
  const value: string
  export = value
}

declare module 'graphql-ws/use/uWebSockets' {
  export * from 'graphql-ws/dist/use/uWebSockets'
}

declare module 'babel-plugin-relay/macro'
declare module '@authenio/samlify-node-xmllint'
declare module 'node-env-flag'
declare module '*getProjectRoot'
declare module 'tayden-clusterfck'
declare module 'jest-extended'
declare module 'json2csv/lib/JSON2CSVParser'
declare module 'object-hash'
declare module 'string-score'
declare module 'md-to-adf'

declare const __APP_VERSION__: string
declare const __PRODUCTION__: boolean
declare const __SOCKET_PORT__: string
declare const __webpack_public_path__: string

interface Window {
  __ACTION__: {
    atlassian: string
    github: string
    google: string
    sentry: string
    slack: string
    oauth2Redirect: string
    stripe: string
    prblIn: string | undefined
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
