import {parseOneAddress} from 'email-addresses'
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
import {guessName} from './guessName'
import {logSCIMRequest} from './logSCIMRequest'
import {mapToSCIM} from './mapToSCIM'
import {SCIMContext} from './SCIMContext'
import {softDeleteUser} from './softDeleteUser'
import {getUserCategory} from './UserCategory'

SCIMMY.Resources.declare(SCIMMY.Resources.User).ingress(
  async (resource, instance, context: SCIMContext) => {
    const {ip, authToken, dataLoader} = context
    const scimId = authToken.sub!

    const {id: userId} = resource

    logSCIMRequest(scimId, ip, {operation: `User ingress`, userId, instance})

    const {userName: denormUserName, displayName, emails, externalId, name, active} = instance
    const {givenName, familyName} = name ?? {}
    const preferredName = displayName
    const userName = denormUserName?.toLowerCase().trim()
    const denormEmail = (emails?.find((email) => email.primary) ?? emails?.[0])?.value
    const email = denormEmail?.toLowerCase().trim()

    if (email && email.length > USER_PREFERRED_NAME_LIMIT) {
      throw new SCIMMY.Types.Error(400, 'invalidValue', 'Email is too long')
    }
    if (email && !parseOneAddress(email)) {
      throw new SCIMMY.Types.Error(400, 'invalidValue', 'Email is not valid')
    }
    const saml = await dataLoader.get('saml').loadNonNull(scimId)

    const pg = getKysely()
    if (userId) {
      // updating existing user

      // check they're in the org, add them if not
      const [user, category] = await Promise.all([
        dataLoader.get('users').load(userId),
        getUserCategory(userId, saml, dataLoader)
      ])
      if (!user || !category) {
        throw new SCIMMY.Types.Error(404, '', 'User not found')
      }

      if (active !== undefined) {
        if (!active) {
          const deletedUser = await softDeleteUser({userId, scimId, dataLoader})
          return mapToSCIM(deletedUser)
        }
      }

      if (category !== 'managed') {
        Logger.warn('User ingress attempt to modify unmanaged user', {
          userId,
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
          .load({userId, orgId})
        // ingress means adding the user to the org if not already present
        if (!organizationUser) {
          adjustUserCount(userId, orgId, InvoiceItemType.ADD_USER, dataLoader)
        }
      }

      try {
        const updatedUser = await pg
          .updateTable('User')
          .set({
            scimId,
            scimUserName: userName,
            ...(email ? {email} : {}),
            ...(active !== undefined ? {isRemoved: !active} : {}),
            ...(active ? {reasonRemoved: null} : {}),
            ...(preferredName ? {preferredName} : {}),
            ...(externalId ? {scimExternalId: externalId} : {}),
            ...(givenName ? {scimGivenName: givenName} : {}),
            ...(familyName ? {scimFamilyName: familyName} : {})
          })
          .where('id', '=', userId)
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
      if (!userName) {
        throw new SCIMMY.Types.Error(400, 'invalidValue', 'userName is required')
      }

      const userId = `sso|${generateUID()}`

      // do all the guessing on ingress so it remains stable
      const {givenName: scimGivenName, familyName: scimFamilyName} = guessName({
        scimGivenName: givenName ?? null,
        scimFamilyName: familyName ?? null,
        preferredName: displayName ?? '',
        email
      })

      const preferredName =
        displayName ||
        `${scimGivenName}${scimGivenName && scimFamilyName ? ' ' : ''}${scimFamilyName}` ||
        userName
      const newUser = new User({
        id: userId,
        preferredName,
        email,
        picture: await generateIdenticon(userId, preferredName),
        identities: []
      })
      try {
        await bootstrapNewUser(newUser, false, dataLoader)
        const {orgId} = saml

        const [user] = await Promise.all([
          pg
            .updateTable('User')
            .set({
              scimId,
              scimExternalId: externalId ?? null,
              scimUserName: userName,
              scimGivenName,
              scimFamilyName
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
