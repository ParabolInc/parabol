import getKysely from '../../../postgres/getKysely'

const clearSAMLConnection = (column: 'id' | 'orgId', value: string, lastUpdatedBy: string) => {
  return getKysely()
    .updateTable('SAML')
    .set({
      metadata: null,
      metadataURL: null,
      scimAuthenticationType: null,
      scimBearerToken: null,
      scimOAuthClientId: null,
      scimOAuthClientSecret: null,
      lastUpdatedBy
    })
    .where(column, '=', value)
    .execute()
}

export default clearSAMLConnection
