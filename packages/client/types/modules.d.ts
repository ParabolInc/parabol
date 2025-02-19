// this is just to get typescript to stop complaining about imports
// declare module '*'
declare module '*.jpeg'
declare module '*.jpg'
declare module '*.png' {
  const value: string
  export = value
}
declare module '*.svg'
declare module '*.mp3'
declare module '*.woff2'
declare module 'json2csv/lib/JSON2CSVParser'
declare module 'string-score'
declare module 'babel-plugin-relay/macro' {
  export {graphql as default} from 'react-relay'
}
declare module 'react-textarea-autosize'
declare module 'react-copy-to-clipboard'
declare module 'tayden-clusterfck'
declare module 'react/jsx-runtime'

declare let __webpack_public_path__: string
declare const __PRODUCTION__: string
declare const __APP_VERSION__: string
declare const __SOCKET_PORT__: string
declare const __HOCUS_POCUS_PORT__: string
interface Window {
  __ACTION__: {
    atlassian: string
    datadogClientToken: string | undefined
    datadogApplicationId: string | undefined
    datadogService: string | undefined
    github: string
    google: string
    googleAnalytics: string
    mattermostDisabled: boolean | undefined
    mattermostGlobal: boolean | undefined
    msTeamsDisabled: boolean | undefined
    publicPath: string
    sentry: string
    slack: string
    stripe: string
    oauth2Redirect: string
    hasOpenAI: boolean
    prblIn: string | undefined
    AUTH_INTERNAL_ENABLED: boolean
    AUTH_GOOGLE_ENABLED: boolean
    AUTH_MICROSOFT_ENABLED: boolean
    AUTH_SSO_ENABLED: boolean
    AMPLITUDE_WRITE_KEY: string
    microsoftTenantId: string
    microsoft: string
    GLOBAL_BANNER_ENABLED: boolean
    GLOBAL_BANNER_TEXT: string
    GLOBAL_BANNER_BG_COLOR: string
    GLOBAL_BANNER_COLOR: string
    GIF_PROVIDER: 'gifabol' | 'tenor' | ''
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
