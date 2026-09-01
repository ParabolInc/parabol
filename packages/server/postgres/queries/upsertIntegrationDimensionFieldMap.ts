import getKysely from '../getKysely'
import type {Integrationproviderserviceenum} from '../types/pg'

export interface DimensionFieldMapInput {
  teamId: string
  service: Integrationproviderserviceenum
  repoId: string
  issueType: string | null
  dimensionName: string
  fieldId: string
  fieldName: string | null
  fieldType: string
}

const upsertIntegrationDimensionFieldMap = async (row: DimensionFieldMapInput) => {
  await getKysely()
    .insertInto('IntegrationDimensionFieldMap')
    .values(row)
    .onConflict((oc) =>
      oc
        .columns(['teamId', 'service', 'repoId', 'issueType', 'dimensionName'])
        .doUpdateSet((eb) => ({
          fieldId: eb.ref('excluded.fieldId'),
          fieldName: eb.ref('excluded.fieldName'),
          fieldType: eb.ref('excluded.fieldType')
        }))
    )
    .execute()
}

export default upsertIntegrationDimensionFieldMap
