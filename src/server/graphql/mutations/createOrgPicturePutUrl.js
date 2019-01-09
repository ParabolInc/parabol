import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql'
import CreatePicturePutUrlPayload from 'server/graphql/types/CreatePicturePutUrlPayload'
import {getUserId, isUserBillingLeader} from 'server/utils/authorization'
import getS3PutUrl from 'server/utils/getS3PutUrl'
import validateAvatarUpload from 'server/utils/validateAvatarUpload'
import shortid from 'shortid'
import {sendOrgLeadAccessError} from 'server/utils/authorizationErrors'

const createOrgPicturePutUrl = {
  type: CreatePicturePutUrlPayload,
  description: 'Create a PUT URL on the CDN for an organization’s profile picture',
  args: {
    contentType: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'user-supplied MIME content type'
    },
    contentLength: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'user-supplied file size'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The organization id to update'
    }
  },
  async resolve (source, {orgId, contentType, contentLength}, {authToken, dataLoader}) {
    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
      return sendOrgLeadAccessError(authToken, orgId)
    }

    // VALIDATION
    const ext = validateAvatarUpload(contentType, contentLength)

    // RESOLUTION
    const partialPath = `Organization/${orgId}/picture/${shortid.generate()}.${ext}`
    const url = await getS3PutUrl(contentType, contentLength, partialPath)
    return {url}
  }
}

export default createOrgPicturePutUrl
