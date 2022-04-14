import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
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

const dataloaderLookup = {
  COMMENT: 'comments',
  REFLECTION: 'retroReflections',
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
      reactableId: string | number
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
    const isPgTable = reactableType === 'RESPONSE'
    const rethinkDbTable = rethinkTableLookup[reactableType]
    if (isPgTable) {
      const loaderName = dataloaderLookup[reactableType]
      reactable = (await dataLoader.get(loaderName).load(reactableId as number)) as Reactable
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
    if (isRemove) {
      if (isPgTable) {
        await removeTeamResponseReactji.run(
          {id: reactableId as number, reactji: {shortName: reactji, userId: viewerId}},
          getPg()
        )
        // :TODO: (jmtaber129): remove team response reactji
        // await appendTeamResponseReactji.run
      } else {
        await r
          .table(rethinkDbTable)
          .get(reactableId)
          .update((row: RDatum<Comment | Reflection>) => ({
            reactjis: row('reactjis').difference([subDoc]),
            updatedAt: now
          }))
          .run()
      }
    } else {
      if (isPgTable) {
        await appendTeamResponseReactji.run(
          {id: reactableId as number, reactji: {shortName: reactji, userId: viewerId}},
          getPg()
        )
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
