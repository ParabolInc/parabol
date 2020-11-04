import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import DeleteCommentPayload from '../types/DeleteCommentPayload'
import {IDeleteCommentOnMutationArguments} from 'parabol-client/types/graphql'

const deleteComment = {
  type: GraphQLNonNull(DeleteCommentPayload),
  description: `Delete a comment from a discussion`,
  args: {
    commentId: {
      type: GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {commentId, meetingId}: IDeleteCommentOnMutationArguments,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()

    //AUTH
    const comment = await r
      .table('Comment')
      .get(commentId)
      .run()
    if (!comment || !comment.isActive) {
      return {error: {message: 'Comment does not exist'}}
    }
    const {createdBy, threadId, threadSource} = comment
    if (createdBy !== viewerId) {
      return {error: {message: 'Can only delete your own comment'}}
    }

    // const thread = await dataLoader
    //   .get('threadSources')
    //   .load({sourceId: threadId, type: threadSource})
    // const {meetingId} = thread

    await r
      .table('Comment')
      .get(commentId)
      .update({isActive: false, updatedAt: now})
      .run()

    const data = {commentId}

    publish(SubscriptionChannel.MEETING, meetingId, 'DeleteCommentSuccess', data, subOptions)
    return data
  }
}

export default deleteComment
