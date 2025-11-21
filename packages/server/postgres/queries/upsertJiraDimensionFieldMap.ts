import getKysely from '../getKysely'

const upsertJiraDimensionFieldMap = async (fieldMap: {
  teamId: string
  cloudId: string
  projectKey: string
  issueType: string
  dimensionName: string
  fieldId: string
  fieldName: string
  fieldType: string
}) => {
  return getKysely()
    .insertInto('JiraDimensionFieldMap')
    .values(fieldMap)
    .onConflict((oc) =>
      oc
        .columns(['teamId', 'cloudId', 'projectKey', 'issueType', 'dimensionName'])
        .doUpdateSet((eb) => ({
          fieldId: eb.ref('excluded.fieldId'),
          fieldName: eb.ref('excluded.fieldName'),
          fieldType: eb.ref('excluded.fieldType')
        }))
    )
    .execute()
}
export default upsertJiraDimensionFieldMap
