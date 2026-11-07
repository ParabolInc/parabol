import type {ScaffoldNames} from './makeScaffoldNames.mts'
import ScaffoldError from './ScaffoldError.mts'
import type {ScaffoldFile} from './ScaffoldFile.mts'

const TYPE_DEFS = 'packages/server/graphql/public/typeDefs'
export const INTEGRATION_SERVICE_INTERFACE = `${TYPE_DEFS}/IntegrationService.graphql`

const schemaFiles = (
  {service, pascal}: ScaffoldNames,
  integrationServiceInterface: string,
  createdAt: Date
): ScaffoldFile[] => {
  const declaration = 'interface IntegrationService {'
  const reposField = 'repos: [RepoIntegration!]'
  const declarationAt = integrationServiceInterface.indexOf(declaration)
  if (declarationAt === -1 || !integrationServiceInterface.includes(reposField)) {
    throw new ScaffoldError(
      `${INTEGRATION_SERVICE_INTERFACE}: expected "${declaration}" with "${reposField}"`
    )
  }
  const body = integrationServiceInterface
    .slice(declarationAt + declaration.length)
    .replace(reposField, 'repos: [RepoContainer!]')
  return [
    {
      path: `${TYPE_DEFS}/${pascal}IntegrationService.graphql`,
      contents: `type ${pascal}IntegrationService implements IntegrationService {${body}`
    },
    {
      path: `packages/server/postgres/migrations/${createdAt.toISOString()}_add${pascal}IntegrationProvider.ts`,
      contents: `import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await sql\`ALTER TYPE public."IntegrationProviderServiceEnum" ADD VALUE IF NOT EXISTS '${service}'\`.execute(
    db
  )
}

export async function down(_db: Kysely<any>): Promise<void> {}
`
    }
  ]
}

export default schemaFiles
