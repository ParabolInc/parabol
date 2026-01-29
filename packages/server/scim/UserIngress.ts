import SCIMMY from 'scimmy'
import {InvoiceItemType} from '../../client/types/constEnums'
import adjustUserCount from '../billing/helpers/adjustUserCount'
import User from '../database/types/User'
import generateUID from '../generateUID'
import bootstrapNewUser from '../graphql/mutations/helpers/bootstrapNewUser'
import {generateIdenticon} from '../graphql/private/mutations/helpers/generateIdenticon'
import {USER_PREFERRED_NAME_LIMIT} from '../postgres/constants'
import getKysely from '../postgres/getKysely'
import {Logger} from '../utils/Logger'
import {SCIMContext} from './SCIMContext'
import {mapToSCIM} from './UserEgress'

SCIMMY.Resources.declare(SCIMMY.Resources.User).ingress(
  async (resource, instance, ctx: SCIMContext) => {
    const {authToken, dataLoader} = ctx
    const scimId = authToken.sub!

    const {id} = resource

    const {userName: denormUserName, displayName, emails, externalId} = instance
    const preferredName = displayName
    const userName = denormUserName?.toLowerCase().trim()
    const denormEmail = (emails?.find((email) => email.primary) ?? emails?.[0])?.value
    const email = denormEmail?.toLowerCase().trim()

    if (email && email.length > USER_PREFERRED_NAME_LIMIT) {
      throw new SCIMMY.Types.Error(400, 'invalidValue', 'Email is too long')
    }

    const pg = getKysely()
    console.log('GEORG User ingress', id, resource, userName, denormEmail, externalId)

    if (id) {
      // updating existing user

      // check they're in the org, add them if not
      const [user, saml] = await Promise.all([
        dataLoader.get('users').load(id),
        dataLoader.get('saml').loadNonNull(scimId)
      ])
      if (!user) {
        throw new SCIMMY.Types.Error(404, '', 'User not found')
      }

      const attributeChanged = email || preferredName || externalId || userName
      const isManagedUser = user.scimId === scimId || saml.domains.includes(user.domain!)

      if (attributeChanged && !isManagedUser) {
        console.log('GEORG User ingress attempt to modify unmanaged user', {
          userId: id,
          scimId,
          userScimId: user.scimId,
          userDomain: user.domain,
          samlDomains: saml.domains
        })
        // this allows to probe for existing users, but just for ids, so it's ok in this context
        throw new SCIMMY.Types.Error(403, '', 'User cannot be modified')
      }

      const {orgId} = saml
      if (orgId) {
        const organizationUser = await dataLoader
          .get('organizationUsersByUserIdOrgId')
          .load({userId: id, orgId})
        // ingress means adding the user to the org if not already present
        if (!organizationUser) {
          adjustUserCount(id, orgId, InvoiceItemType.ADD_USER, dataLoader)
        }
      }

      const updateScimId = !user.scimId && saml.domains.includes(user.domain!)

      // no update is success
      if (!attributeChanged && !updateScimId) {
        return mapToSCIM(user)
      }

      try {
        const updatedUser = await pg
          .updateTable('User')
          .set({
            ...(updateScimId ? {scimId} : {}),
            ...(email ? {email} : {}),
            ...(preferredName ? {preferredName} : {}),
            ...(externalId ? {scimExternalId: externalId} : {}),
            ...(userName ? {scimUserName: userName} : {})
          })
          .where('id', '=', id)
          .returningAll()
          .executeTakeFirst()
        if (!updatedUser) {
          throw new SCIMMY.Types.Error(412, '', 'User update failed')
        }
        return mapToSCIM(updatedUser)
      } catch (e) {
        if (e instanceof Error && 'code' in e && e.code === '23505') {
          throw new SCIMMY.Types.Error(409, 'uniqueness', 'User exists')
        }
        Logger.error(e)
        throw new SCIMMY.Types.Error(500, '', 'Internal server error')
      }
    } else {
      // new user
      if (!email) {
        throw new SCIMMY.Types.Error(400, 'invalidValue', 'Email is required')
      }

      const userId = `sso|${generateUID()}`
      const preferredName = displayName ?? userName
      const newUser = new User({
        id: userId,
        preferredName,
        email,
        picture: await generateIdenticon(userId, preferredName),
        identities: []
      })
      try {
        const [, saml] = await Promise.all([
          bootstrapNewUser(newUser, false, dataLoader),
          dataLoader.get('saml').load(authToken.sub!)
        ])
        const {orgId} = saml ?? {}
        const [user] = await Promise.all([
          pg
            .updateTable('User')
            .set({
              scimId,
              scimExternalId: externalId ?? null,
              scimUserName: userName
            })
            .where('id', '=', userId)
            .returningAll()
            .executeTakeFirst(),
          orgId && adjustUserCount(userId, orgId, InvoiceItemType.ADD_USER, dataLoader)
        ])
        return mapToSCIM(user)
      } catch (e) {
        if (e instanceof Error && 'code' in e && e.code === '23505') {
          throw new SCIMMY.Types.Error(409, 'uniqueness', 'User exists')
        }
        Logger.error(e)
        throw new SCIMMY.Types.Error(500, '', 'Internal server error')
      }
    }
  }
)
