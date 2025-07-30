import type {DataLoaderWorker} from '../../../graphql'
import isValid from '../../../isValid'

export const getIsAnyUserOrgLocked = async (userId: string, dataLoader: DataLoaderWorker) => {
  const orgUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
  const orgIds = orgUsers.map((ou) => ou.orgId)
  const orgs = await dataLoader.get('organizations').loadMany(orgIds)

  const unpaidOrg = orgs.filter(isValid).some((org) => !org.isPaid)
  if (unpaidOrg) {
    return new Error(
      'One of your organizations is not paid. Please reach out to your account admin or support@parabol.co for more information'
    )
  }
  return undefined
}
