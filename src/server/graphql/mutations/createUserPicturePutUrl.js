import {GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import {getUserId, requireAuth} from 'server/utils/authorization';
import getS3PutUrl from 'server/utils/getS3PutUrl';
import {validateAvatarUpload} from 'server/utils/utils';
import shortid from 'shortid';

const createUserPicturePutUrl = {
  type: GraphQLURLType,
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
  resolve(source, {contentType, contentLength}, {authToken}) {
    // AUTH
    requireAuth(authToken);
    const userId = getUserId(authToken);

    // VALIDATION
    const ext = validateAvatarUpload(contentType, contentLength);

    // RESOLUTION
    const partialPath = `User/${userId}/picture/${shortid.generate()}.${ext}`;
    return getS3PutUrl(contentType, contentLength, partialPath);
  }
};

export default createUserPicturePutUrl;
