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
declare module 'string-score'
declare module 'babel-plugin-relay/macro' {
  export {graphql as default} from 'react-relay'
}
declare module 'unicode-substring'
declare module 'emoji-mart/dist-modern/utils/index.js'
declare module 'emoji-mart/dist-modern/utils/data.js'
declare module 'emoji-mart/dist-modern/components/picker/nimble-picker'
declare module 'react-textarea-autosize'
declare module 'react-copy-to-clipboard'

declare const __PRODUCTION__: string
declare const __APP_VERSION__: string
declare const __SOCKET_PORT__: string
interface Window {
  __ACTION__: {
    atlassian: string
    datadogClientToken: string | undefined
    datadogApplicationId: string | undefined
    datadogService: string | undefined
    github: string
    google: string
    segment: string
    sentry: string
    slack: string
    stripe: string
    oauth2Redirect: string
    prblIn: string
    AUTH_INTERNAL_ENABLED: boolean
    AUTH_GOOGLE_ENABLED: boolean
    AUTH_SSO_ENABLED: boolean
  }
}
declare type Json = null | boolean | number | string | Json[] | {[key: string]: Json}

//TODO: remove after migrating to es2021 - https://github.com/microsoft/TypeScript/issues/46907
declare namespace Intl {
  type ListType = 'conjunction' | 'disjunction'

  interface ListFormatOptions {
    localeMatcher?: 'lookup' | 'best fit'
    type?: ListType
    style?: 'long' | 'short' | 'narrow'
  }

  class ListFormat {
    constructor(locales?: string | string[], options?: ListFormatOptions)
    format(values: any[]): string
  }
}
