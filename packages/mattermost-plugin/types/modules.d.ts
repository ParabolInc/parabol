// these are from client/modules.d.ts. they are used since mattermost-plugin imports from there
declare module '*.svg'
declare module 'string-score'
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

declare module 'babel-plugin-relay/macro' {
  export {graphql as default} from 'react-relay'
}
