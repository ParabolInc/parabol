import ClientActionVarsT from 'parabol-client/types/ClientActionVarsT'

// These environment variables are kept here as a DX improvement:
//
// By building them in the toolbox, they are accessible to both the
// webpack JS and application TS domains.
//
// `yarn dev` will load these via scripts/webpack/dev.client.config.js
// `yarn start` will load these via packages/server/createSSR.ts

const getClientActionVars = (): ClientActionVarsT => ({
  atlassian: process.env.ATLASSIAN_CLIENT_ID,
  github: process.env.GITHUB_CLIENT_ID,
  google: process.env.GOOGLE_OAUTH_CLIENT_ID,
  segment: process.env.SEGMENT_WRITE_KEY,
  sentry: process.env.SENTRY_DSN,
  slack: process.env.SLACK_CLIENT_ID,
  stripe: process.env.STRIPE_PUBLISHABLE_KEY,
  prblIn: process.env.INVITATION_SHORTLINK
})

export default getClientActionVars
