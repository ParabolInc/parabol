declare module '*.jpeg'
declare module '*.jpg'
declare module '*.png' {
  const value: string
  export = value
}
declare module '*.svg'
declare module '*.mp3'
declare module '*.woff2'

declare module 'babel-plugin-relay/macro' {
  export {graphql as default} from 'react-relay'
}

declare module '*.graphql' {
  const value: string
  export = value
}

declare module 'react-textarea-autosize'
declare module 'react-copy-to-clipboard'
declare module 'react/jsx-runtime'
declare module '@authenio/samlify-node-xmllint'
declare module 'node-env-flag'
declare module '*getProjectRoot'
declare module 'tayden-clusterfck'
declare module 'jest-extended'
declare module 'object-hash'
declare module 'string-score'
declare module 'md-to-adf'

declare let __webpack_public_path__: string
declare const __PRODUCTION__: boolean
declare const __APP_VERSION__: string

interface Window {
  __ACTION__: {
    atlassian: string
    datadogClientToken: string | undefined
    datadogApplicationId: string | undefined
    datadogService: string | undefined
    github: string
    google: string
    googleAnalytics: string
    mattermostWebhookIntegrationDisabled: boolean | undefined
    msTeamsWebhookIntegrationDisabled: boolean | undefined
    publicPath: string
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
    HUBSPOT_ERROR_FORM_URL: string
  }
}
declare type Json = null | boolean | number | string | Json[] | {[key: string]: Json}
