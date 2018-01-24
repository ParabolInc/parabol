import {GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql';
import CreateUserPicturePutUrlPayload from 'server/graphql/types/CreateUserPicturePutUrlPayload';
import {getUserId, requireAuth} from 'server/utils/authorization';
import getS3PutUrl from 'server/utils/getS3PutUrl';
import {validateAvatarUpload} from 'server/utils/utils';
import shortid from 'shortid';

const createUserPicturePutUrl = {
  type: CreateUserPicturePutUrlPayload,
  description: 'Create a PUT URL on the CDN for the currently authenticated user’s profile picture',
  args: {
    contentType: {
      type: GraphQLString,
      description: 'user-supplied MIME content type'
    },
    contentLength: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'user-supplied file size'
    }
  },
  resolve: async (source, {contentType, contentLength}, {authToken}) => {
    // AUTH
    requireAuth(authToken);
    const userId = getUserId(authToken);

    // VALIDATION
    const ext = validateAvatarUpload(contentType, contentLength);

    // RESOLUTION
    const partialPath = `User/${userId}/picture/${shortid.generate()}.${ext}`;
    const url = await getS3PutUrl(contentType, contentLength, partialPath);
    return {url};
  }
};

export default createUserPicturePutUrl;
