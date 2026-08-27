import type {LinearRepoIntegration} from 'parabol-client/shared/gqlIds/IntegrationRepoId'

export type LinearProjectRepo = LinearRepoIntegration & {
  displayName: string
}

export type LinearTeamRepo = LinearRepoIntegration & {
  name: string
}

export type LinearRepo = LinearProjectRepo | LinearTeamRepo
