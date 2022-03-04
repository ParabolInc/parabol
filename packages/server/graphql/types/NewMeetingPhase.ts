import {GQLContext} from './../graphql'
import {
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType
} from 'graphql'
import {
  AGENDA_ITEMS,
  CHECKIN,
  DISCUSS,
  FIRST_CALL,
  GROUP,
  LAST_CALL,
  REFLECT,
  RESPONSES,
  UPDATES,
  VOTE
} from 'parabol-client/utils/constants'
import {resolveGQLStagesFromPhase} from '../resolvers'
import AgendaItemsPhase from './AgendaItemsPhase'
import CheckInPhase from './CheckInPhase'
import DiscussPhase from './DiscussPhase'
import EstimatePhase from './EstimatePhase'
import GenericMeetingPhase from './GenericMeetingPhase'
import NewMeetingPhaseTypeEnum from './NewMeetingPhaseTypeEnum'
import {NewMeetingPhaseTypeEnum as INewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import NewMeetingStage from './NewMeetingStage'
import ReflectPhase from './ReflectPhase'
import UpdatesPhase from './UpdatesPhase'

export const newMeetingPhaseFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  meetingId: {
    type: new GraphQLNonNull(GraphQLID)
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID)
  },
  phaseType: {
    type: new GraphQLNonNull(NewMeetingPhaseTypeEnum),
    description: 'The type of phase'
  },
  stages: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NewMeetingStage))),
    resolve: resolveGQLStagesFromPhase
  }
})

const resolveTypeLookup = {
  [CHECKIN]: CheckInPhase,
  [REFLECT]: ReflectPhase,
  [GROUP]: GenericMeetingPhase,
  [VOTE]: GenericMeetingPhase,
  [DISCUSS]: DiscussPhase,
  [UPDATES]: UpdatesPhase,
  [FIRST_CALL]: GenericMeetingPhase,
  [AGENDA_ITEMS]: AgendaItemsPhase,
  [LAST_CALL]: GenericMeetingPhase,
  [RESPONSES]: GenericMeetingPhase,
  SCOPE: GenericMeetingPhase,
  ESTIMATE: EstimatePhase
} as Record<INewMeetingPhaseTypeEnum, GraphQLObjectType<any, GQLContext>>

const NewMeetingPhase: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'NewMeetingPhase',
  fields: newMeetingPhaseFields,
  resolveType: ({phaseType}: {phaseType: INewMeetingPhaseTypeEnum}) => resolveTypeLookup[phaseType]
})

export default NewMeetingPhase
