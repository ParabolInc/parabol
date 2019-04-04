import {GraphQLID, GraphQLNonNull} from 'graphql'
import AddAtlassianProjectPayload from 'server/graphql/types/AddAtlassianProjectPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import shortid from 'shortid'
import {TEAM} from 'universal/utils/constants'
import promiseAllPartial from 'universal/utils/promiseAllPartial'
import getRethink from '../../database/rethinkDriver'
import AtlassianManager from '../../utils/AtlassianManager'
import standardError from '../../utils/standardError'

export default {
  name: 'AddAtlassianProject',
  type: new GraphQLNonNull(AddAtlassianProjectPayload),
  args: {
    cloudId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    atlassianProjectId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {cloudId, atlassianProjectId, teamId},
    {authToken, socketId: mutatorId, dataLoader}
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const r = getRethink()
    const now = new Date()

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // VALIDATION
    const viewerAccessToken = await dataLoader.get('freshAtlassianAccessToken').load(viewerId)
    const manager = new AtlassianManager(viewerAccessToken)
    const project = await manager.getProject(cloudId, atlassianProjectId)
    if ('message' in project) {
      return standardError(new Error(project.message), {userId: viewerId})
    }

    // RESOLUTION
    const teamMembers = (await dataLoader.get('teamMembersByTeamId').load(teamId)) as any[]
    const userIds = teamMembers.map(({userId}) => userId).filter((userId) => userId !== viewerId)
    const teamMemberAccessTokens = await dataLoader
      .get('freshAtlassianAccessToken')
      .loadMany(userIds)
    const perms = await promiseAllPartial(
      teamMemberAccessTokens.map(async (accessToken) => {
        const manager = new AtlassianManager(accessToken)
        const project = await manager.getProject(cloudId, atlassianProjectId)
        return !('message' in project)
      }),
      () => false
    )
    const permittedUserIds = userIds.filter((_, idx) => perms[idx])

    const projectId = shortid.generate()
    await r.table('AtlassianProject').insert({
      id: projectId,
      cloudId,
      atlassianProjectId,
      adminUserId: viewerId,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      teamId,
      userIds: [viewerId, ...permittedUserIds]
    })

    const data = {atlassianProjectId, teamId}
    publish(TEAM, teamId, AddAtlassianProjectPayload, data, subOptions)
    return data
  }
}
