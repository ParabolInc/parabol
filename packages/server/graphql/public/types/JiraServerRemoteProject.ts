import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import JiraServerRestManager from '../../../integrations/jiraServer/JiraServerRestManager'
import {IntegrationProviderJiraServer} from '../../../postgres/queries/getIntegrationProvidersByIds'
import defaultJiraProjectAvatar from '../../../utils/defaultJiraProjectAvatar'
import {JiraServerRemoteProjectResolvers} from '../resolverTypes'

const JiraServerRemoteProject: JiraServerRemoteProjectResolvers = {
  __isTypeOf: ({service}) => service === 'jiraServer',
  id: (item) => IntegrationRepoId.join(item),
  service: () => 'jiraServer',

  avatar: async ({avatarUrls, teamId, userId}, _args, {dataLoader}) => {
    const url = avatarUrls['48x48']
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'jiraServer', teamId, userId})
    if (!auth) return defaultJiraProjectAvatar
    const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)
    const manager = new JiraServerRestManager(auth, provider as IntegrationProviderJiraServer)
    const avatar = await manager.getProjectAvatar(url)
    return avatar || defaultJiraProjectAvatar
  }
}

export default JiraServerRemoteProject
