/**
 * Changes the editing state of a retrospective reflection.
 *
 * @flow
 */
import type {Context} from 'server/flowtypes/graphql'
import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import DragReflectionPayload from 'server/graphql/types/DragReflectionPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import {sendMeetingNotFoundError, sendReflectionNotFoundError} from 'server/utils/docNotFoundErrors'
import publish from 'server/utils/publish'
import {GROUP, TEAM} from 'universal/utils/constants'
import {
  sendAlreadyCompletedMeetingPhaseError,
  sendAlreadyEndedMeetingError
} from 'server/utils/alreadyMutatedErrors'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'
import UpdateDragLocationPayload from 'server/graphql/types/UpdateDragLocationPayload'

type Args = {
  isDragging: boolean,
  reflectionId: string
}

export default {
  description: 'all the info required to provide an accurate display-specific location of where an item is',
  type: UpdateDragLocationPayload,
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isDragging: {
      description: 'true if the viewer is starting a drag, else false',
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  },
  async resolve (
    source: Object,
    {data, teamId}: Args,
    {authToken, dataLoader, socketId: mutatorId}: Context
  ) {
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}

    publish(TEAM, teamId, DragReflectionPayload, data, subOptions)
    return data
  }
}
