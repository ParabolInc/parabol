import SCIMMY from 'scimmy'
import {User} from '../postgres/types'
import {guessName} from './guessName'

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
