import SCIMMY from 'scimmy'
import {DataLoaderWorker} from '../graphql/graphql'
import type {SAMLSource} from '../graphql/public/types/SAML'
import {Team, User} from '../postgres/types'
import {getVisibleUserIds} from './getVisibleUserIds'
import {guessName} from './guessName'

export const mapUserToSCIM = (
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

export const mapGroupToSCIM = async (
  team: Pick<Team, 'id' | 'name'>,
  saml: SAMLSource,
  dataLoader: DataLoaderWorker
) => {
  if (!team) {
    throw new SCIMMY.Types.Error(404, '', 'Team not found')
  }
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(team.id)
  const visibleUserIds = await getVisibleUserIds(
    teamMembers.map(({userId}) => userId),
    saml,
    dataLoader
  )

  const members = await Promise.all(
    visibleUserIds.map(async (userId) => {
      const user = await dataLoader.get('users').load(userId)
      return {
        value: userId,
        display: user?.preferredName || user?.email || 'Unknown User'
      }
    })
  )

  return {
    id: team.id,
    displayName: team.name,
    members
  }
}
