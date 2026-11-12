import {GraphQLError} from 'graphql'
import type AuthToken from '../../../../database/types/AuthToken'
import type {MeetingTemplate} from '../../../../postgres/types'
import {isTeamMember} from '../../../../utils/authorization'
import type {DataLoaderWorker} from '../../../graphql'

const assertTemplateAccess = async (
  template: Pick<MeetingTemplate, 'scope' | 'teamId'>,
  meetingTeamOrgIds: string[],
  authToken: AuthToken,
  dataLoader: DataLoaderWorker
) => {
  const {scope, teamId} = template
  if (scope === 'TEAM' && !isTeamMember(authToken, teamId)) {
    throw new GraphQLError('Template is scoped to team', {extensions: {code: 'FORBIDDEN'}})
  }
  if (scope === 'ORGANIZATION') {
    const templateTeam = await dataLoader.get('teams').loadNonNull(teamId)
    if (meetingTeamOrgIds.some((orgId) => orgId !== templateTeam.orgId)) {
      throw new GraphQLError('Template is scoped to organization', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
  }
}

export default assertTemplateAccess
