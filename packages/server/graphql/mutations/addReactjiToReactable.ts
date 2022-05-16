import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {ValueOf} from 'parabol-client/types/generics'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {RDatum} from '../../database/stricterR'
import Comment from '../../database/types/Comment'
import {Reactable} from '../../database/types/Reactable'
import Reflection from '../../database/types/Reflection'
import getPg from '../../postgres/getPg'
import {appendTeamResponseReactji} from '../../postgres/queries/generated/appendTeamResponseReactjiQuery'
import {removeTeamResponseReactji} from '../../postgres/queries/generated/removeTeamResponseReactjiQuery'
import {getUserId} from '../../utils/authorization'
import emojiIds from '../../utils/emojiIds'
import getGroupedReactjis from '../../utils/getGroupedReactjis'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import AddReactjiToReactablePayload from '../types/AddReactjiToReactablePayload'
import getReactableType from '../types/getReactableType'
import ReactableEnum, {ReactableEnumType} from '../types/ReactableEnum'

const rethinkTableLookup = {
  COMMENT: 'Comment',
  REFLECTION: 'RetroReflection'
} as const

const pgDataloaderLookup = {
  RESPONSE: 'teamPromptResponses'
} as const

const addReactjiToReactable = {
  type: new GraphQLNonNull(AddReactjiToReactablePayload),
  description: `Add or remove a reactji from a reactable`,
  args: {
    reactableId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the reactable'
    },
    reactableType: {
      type: new GraphQLNonNull(ReactableEnum),
      description: 'the type of the'
    },
    reactji: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the id of the reactji to add'
    },
    isRemove: {
      type: GraphQLBoolean,
      description: 'If true, remove the reaction, else add it'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the meeting'
    }
  },
  resolve: async (
    _source: unknown,
    {
      reactableId,
      reactableType,
      reactji,
      isRemove,
      meetingId
    }: {
      reactableId: string
      reactableType: ReactableEnumType
      reactji: string
      isRemove?: boolean | null
      meetingId: string
    },
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    let reactable: Reactable
    const pgLoaderName = pgDataloaderLookup[reactableType] as ValueOf<
      typeof pgDataloaderLookup
    > | null
    const rethinkDbTable = rethinkTableLookup[reactableType]
    if (pgLoaderName) {
      reactable = await dataLoader.get(pgLoaderName).loadNonNull(reactableId)
    } else {
      reactable = (await r.table(rethinkDbTable).get(reactableId).run()) as Reactable
    }
    if (!reactable) {
      return {error: {message: `Item does not exist`}}
    }
    const {reactjis} = reactable
    const verifiedType = getReactableType(reactable)
    if (verifiedType !== reactableType) {
      return {error: {message: `Unknown item`}}
    }
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const viewerMeetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    if (!viewerMeetingMember) {
      return {error: {message: `Not a member of the meeting`}}
    }

    // VALIDATION
    if (!emojiIds.includes(reactji)) {
      return {error: {message: `invalid emoji`}}
    }

    if (!isRemove) {
      const groupedReactjis = getGroupedReactjis(reactjis, viewerId, reactableId)
      const nextReactjiId = `${reactableId}:${reactji}`
      const isReactjiPresent = !!groupedReactjis.find((agg) => agg.id === nextReactjiId)
      // console.log('is present', isReactjiPresent, reactji, groupedReactjis)
      if (!isReactjiPresent && groupedReactjis.length >= Threshold.MAX_REACTJIS) {
        return {error: {message: `Reactji limit reached`}}
      }
    }

    // RESOLUTION
    const subDoc = {id: reactji, userId: viewerId}
    if (pgLoaderName) {
      if (isRemove) {
        const numberReactableId = TeamPromptResponseId.split(reactableId)
        await removeTeamResponseReactji.run(
          {id: numberReactableId, reactji: {shortname: reactji, userid: viewerId}},
          getPg()
        )
      } else {
        const numberReactableId = TeamPromptResponseId.split(reactableId)
        await appendTeamResponseReactji.run(
          {id: numberReactableId, reactji: {shortname: reactji, userid: viewerId}},
          getPg()
        )
      }

      dataLoader.get(pgLoaderName).clear(reactableId)
    } else {
      if (isRemove) {
        await r
          .table(rethinkDbTable)
          .get(reactableId)
          .update((row: RDatum<Comment | Reflection>) => ({
            reactjis: row('reactjis').difference([subDoc]),
            updatedAt: now
          }))
          .run()
      } else {
        await r
          .table(rethinkDbTable)
          .get(reactableId)
          .update((row: RDatum<Comment | Reflection>) => ({
            reactjis: r.branch(
              row('reactjis').contains(subDoc),
              row('reactjis'),
              // don't use distinct, it sorts the fields
              row('reactjis').append(subDoc)
            ),
            updatedAt: now
          }))
          .run()
      }
    }

    const data = {reactableId, reactableType}
    if (meetingId) {
      publish(
        SubscriptionChannel.MEETING,
        meetingId,
        'AddReactjiToReactableSuccess',
        data,
        subOptions
      )
    }
    return data
  }
}

export default addReactjiToReactable
