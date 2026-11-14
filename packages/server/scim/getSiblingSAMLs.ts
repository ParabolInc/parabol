import type {DataLoaderWorker} from '../graphql/graphql'
import type {SAMLSource} from '../graphql/public/types/SAML'

export const getSiblingSAMLs = async (
  saml: Pick<SAMLSource, 'id' | 'orgId'>,
  dataLoader: DataLoaderWorker
) => {
  if (!saml.orgId) return []
  const samls = await dataLoader.get('samlsByOrgId').load(saml.orgId)
  return samls.filter(({id}) => id !== saml.id)
}
