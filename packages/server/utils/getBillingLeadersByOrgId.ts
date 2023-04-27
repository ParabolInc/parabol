import {DataLoaderWorker} from '../graphql/graphql'
import isValid from '../graphql/isValid'

export const getBillingLeadersByOrgId = async (orgId: string, dataLoader: DataLoaderWorker) => {
  const billingLeadersIds = await dataLoader.get('billingLeadersIdsByOrgId').load(orgId)
  return (await dataLoader.get('users').loadMany(billingLeadersIds)).filter(isValid)
}
