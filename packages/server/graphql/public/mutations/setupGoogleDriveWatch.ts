import {GraphQLError} from 'graphql'
import {setupGdriveFileWatcher} from '../../../integrations/gdrive/setupGdriveFileWatcher'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const setupGoogleDriveWatch: MutationResolvers['setupGoogleDriveWatch'] = async (
  _source,
  {teamId},
  {authToken, dataLoader}
) => {
  const userId = getUserId(authToken)

  const gdriveAuth = await dataLoader.get('freshGdriveAuth').load({teamId, userId})
  if (!gdriveAuth) {
    throw new GraphQLError('Google Drive not connected for this team')
  }

  await setupGdriveFileWatcher(gdriveAuth, userId, teamId)
  dataLoader.get('freshGdriveAuth').clearAll()
  return {integration: {teamId, userId}}
}

export default setupGoogleDriveWatch
