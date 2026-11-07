import type {ScaffoldFile} from './ScaffoldFile.mts'
import type {ScaffoldNames} from './scaffoldNames.mts'

const TYPE_DEFS = 'packages/server/graphql/public/typeDefs'
export const INTEGRATION_SERVICE_INTERFACE = `${TYPE_DEFS}/IntegrationService.graphql`

const schemaFiles = (
  {service, pascal}: ScaffoldNames,
  integrationServiceInterface: string,
  createdAt: Date
): ScaffoldFile[] => {
  const declaration = 'interface IntegrationService {'
  const body = integrationServiceInterface.slice(
    integrationServiceInterface.indexOf(declaration) + declaration.length
  )
  return [
    {
      path: `${TYPE_DEFS}/${pascal}IntegrationService.graphql`,
      contents: `type ${pascal}IntegrationService implements IntegrationService {${body}`
    },
    {
      path: `packages/server/postgres/migrations/${createdAt.toISOString()}_add${pascal}IntegrationService.ts`,
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
