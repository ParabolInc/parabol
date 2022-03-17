
// this is just to get typescript to stop complaining about imports
// declare module '*'
declare module '*.jpeg'
declare module '*.png' {
  const value: string
  export = value
}
declare module '*.svg'
declare module '*.woff2'
declare module 'json2csv/lib/JSON2CSVParser'

declare const __PRODUCTION__: string
declare const __APP_VERSION__: string
declare const __SOCKET_PORT__: string
interface Window {
  __ACTION__: {
    atlassian: string
    datadogClientToken: string | undefined
    datadogApplicationId: string | undefined
    datadogService: string | undefined
    logRocket: string | undefined
    github: string
    google: string
    segment: string
    sentry: string
    slack: string
    stripe: string
    prblIn: string
    AUTH_INTERNAL_ENABLED: boolean
    AUTH_GOOGLE_ENABLED: boolean
    AUTH_SSO_ENABLED: boolean
  }
}
declare type Json = null | boolean | number | string | Json[] | {[key: string]: Json}
