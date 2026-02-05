import SCIMMY from 'scimmy'
import {User} from '../postgres/types'

// Guess the first and last name for existing users
// Okta really really wants these, even for existing users where we don't have any values, so guess them and let Okta update these if needed
const guessName = (
  user: Pick<User, 'email' | 'preferredName' | 'scimGivenName' | 'scimFamilyName'>
): {givenName: string; familyName: string} => {
  const {preferredName, email, scimGivenName, scimFamilyName} = user
  let givenName = scimGivenName
  let familyName = scimFamilyName

  if (!scimGivenName || !scimFamilyName) {
    const nameParts = preferredName.split(' ')
    if (!scimGivenName && nameParts.length >= 2) {
      givenName = nameParts[0]!
    }
    if (!scimFamilyName && nameParts.length >= 2) {
      familyName = nameParts[nameParts.length - 1]!
    }
  }

  if (!givenName || !familyName) {
    const emailParts = email.split('@')[0]!.split('.')
    if (!givenName && emailParts.length >= 2) {
      givenName = emailParts[0]!
    }
    if (!familyName && emailParts.length >= 2) {
      familyName = emailParts[emailParts.length - 1]!
    }
  }

  if (!givenName || !familyName) {
    const local = email.split('@')[0]!
    const capitalized = local.charAt(0).toUpperCase() + local.slice(1)

    if (!givenName) {
      givenName = preferredName || capitalized
    }
    if (!familyName) {
      familyName = capitalized
    }
  }

  return {givenName, familyName}
}

export const mapToSCIM = (
  user?: Pick<
    User,
    | 'id'
    | 'scimExternalId'
    | 'scimUserName'
    | 'persistentNameId'
    | 'email'
    | 'preferredName'
    | 'scimGivenName'
    | 'scimFamilyName'
    | 'isRemoved'
  >
) => {
  if (!user) {
    throw new SCIMMY.Types.Error(404, '', 'User not found')
  }

  return {
    id: user.id,
    externalId: user.scimExternalId ?? undefined,
    userName: user.scimUserName ?? user.persistentNameId ?? user.email,
    displayName: user.preferredName,
    active: !user.isRemoved,
    name: guessName(user),
    emails: [
      {
        value: user.email,
        type: 'work',
        primary: true
      }
    ]
  }
}
