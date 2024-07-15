import {sql} from 'kysely'
import {InvoiceItemType} from 'parabol-client/types/constEnums'
import generateUID from '../../generateUID'
import {DataLoaderWorker} from '../../graphql/graphql'
import isValid from '../../graphql/isValid'
import getKysely from '../../postgres/getKysely'
import insertOrgUserAudit from '../../postgres/helpers/insertOrgUserAudit'
import {OrganizationUserAuditEventTypeEnum} from '../../postgres/queries/generated/insertOrgUserAuditQuery'
import {getUserById} from '../../postgres/queries/getUsersByIds'
import IUser from '../../postgres/types/IUser'
import {Logger} from '../../utils/Logger'
import {analytics} from '../../utils/analytics/analytics'
import getActiveDomainForOrgId from '../../utils/getActiveDomainForOrgId'
import getDomainFromEmail from '../../utils/getDomainFromEmail'
import handleEnterpriseOrgQuantityChanges from './handleEnterpriseOrgQuantityChanges'
import handleTeamOrgQuantityChanges from './handleTeamOrgQuantityChanges'

const maybeUpdateOrganizationActiveDomain = async (
  orgId: string,
  newUserEmail: string,
  dataLoader: DataLoaderWorker
) => {
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  const {isActiveDomainTouched, activeDomain} = organization
  // don't modify if the domain was set manually
  if (isActiveDomainTouched) return

  //don't modify if the user doesn't have a company tld or has the same tld as the active one
  const newUserDomain = getDomainFromEmail(newUserEmail)
  if (
    newUserDomain === activeDomain ||
    !(await dataLoader.get('isCompanyDomain').load(newUserDomain))
  )
    return

  // don't modify if we can't guess the domain or the domain we guess is the current domain
  const domain = await getActiveDomainForOrgId(orgId, dataLoader)
  if (!domain || domain === activeDomain) return
  organization.activeDomain = domain
  const pg = getKysely()
  await pg.updateTable('Organization').set({activeDomain: domain}).where('id', '=', orgId).execute()
}

const changePause = (inactive: boolean) => async (_orgIds: string[], user: IUser) => {
  const pg = getKysely()
  const {id: userId, email} = user
  inactive ? analytics.accountPaused(user) : analytics.accountUnpaused(user)
  analytics.identify({
    userId,
    email,
    isActive: !inactive
  })
  await pg
    .with('User', (qb) => qb.updateTable('User').set({inactive}).where('id', '=', userId))
    .updateTable('OrganizationUser')
    .set({inactive})
    .where('userId', '=', userId)
    .where('removedAt', 'is', null)
    .execute()
}

const addUser = async (orgIds: string[], user: IUser, dataLoader: DataLoaderWorker) => {
  const {id: userId} = user
  const [rawOrganizations, organizationUsers] = await Promise.all([
    dataLoader.get('organizations').loadMany(orgIds),
    dataLoader.get('organizationUsersByUserId').load(userId)
  ])
  dataLoader.get('organizationUsersByUserId').clear(userId)
  const organizations = rawOrganizations.filter(isValid)
  const docs = orgIds.map((orgId) => {
    const oldOrganizationUser = organizationUsers.find(
      (organizationUser) => organizationUser.orgId === orgId
    )
    const organization = organizations.find((organization) => organization.id === orgId)!
    // continue the grace period from before, if any OR set to the end of the invoice OR (if it is a free account) no grace period
    return {
      id: oldOrganizationUser?.id || generateUID(),
      orgId,
      userId,
      tier: organization.tier
    }
  })
  await getKysely()
    .insertInto('OrganizationUser')
    .values(docs)
    .onConflict((oc) => oc.doNothing())
    .execute()
  await Promise.all(
    orgIds.map((orgId) => {
      return maybeUpdateOrganizationActiveDomain(orgId, user.email, dataLoader)
    })
  )
}

const deleteUser = async (orgIds: string[], user: IUser) => {
  orgIds.forEach((orgId) => analytics.userRemovedFromOrg(user, orgId))
  await getKysely()
    .updateTable('OrganizationUser')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('userId', '=', user.id)
    .where('orgId', 'in', orgIds)
    .execute()
}

const dbActionTypeLookup = {
  [InvoiceItemType.ADD_USER]: addUser,
  [InvoiceItemType.AUTO_PAUSE_USER]: changePause(true),
  [InvoiceItemType.PAUSE_USER]: changePause(true),
  [InvoiceItemType.REMOVE_USER]: deleteUser,
  [InvoiceItemType.UNPAUSE_USER]: changePause(false)
}

const auditEventTypeLookup = {
  [InvoiceItemType.ADD_USER]: 'added',
  [InvoiceItemType.AUTO_PAUSE_USER]: 'inactivated',
  [InvoiceItemType.PAUSE_USER]: 'inactivated',
  [InvoiceItemType.REMOVE_USER]: 'removed',
  [InvoiceItemType.UNPAUSE_USER]: 'activated'
} as {[key in InvoiceItemType]: OrganizationUserAuditEventTypeEnum}

/**
 * Also adds the organization user if not present
 */
export default async function adjustUserCount(
  userId: string,
  orgInput: string | string[],
  type: InvoiceItemType,
  dataLoader: DataLoaderWorker
) {
  const orgIds = Array.isArray(orgInput) ? orgInput : [orgInput]

  const user = (await getUserById(userId))!

  const dbAction = dbActionTypeLookup[type]
  await dbAction(orgIds, user, dataLoader)
  const auditEventType = auditEventTypeLookup[type]
  await insertOrgUserAudit(orgIds, userId, auditEventType)

  const organizations = await dataLoader.get('organizations').loadMany(orgIds)
  const paidOrgs = organizations.filter(isValid).filter((org) => org.stripeSubscriptionId)

  handleEnterpriseOrgQuantityChanges(paidOrgs, dataLoader).catch()
  handleTeamOrgQuantityChanges(paidOrgs).catch(Logger.error)
}
