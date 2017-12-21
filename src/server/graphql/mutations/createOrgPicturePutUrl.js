import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql';
import CreatePicturePutUrlPayload from 'server/graphql/types/CreatePicturePutUrlPayload';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import getS3PutUrl from 'server/utils/getS3PutUrl';
import {validateAvatarUpload} from 'server/utils/utils';
import shortid from 'shortid';

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
  async resolve(source, {orgId, contentType, contentLength}, {authToken}) {
    // AUTH
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

    // VALIDATION
    const ext = validateAvatarUpload(contentType, contentLength);

    // RESOLUTION
    const partialPath = `Organization/${orgId}/picture/${shortid.generate()}.${ext}`;
    const url = getS3PutUrl(contentType, contentLength, partialPath);
    return {url};
  }
};

export default createOrgPicturePutUrl;
