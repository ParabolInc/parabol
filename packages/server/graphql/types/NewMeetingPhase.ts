import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import AgendaItemsPhase from 'server/graphql/types/AgendaItemsPhase'
import CheckInPhase from 'server/graphql/types/CheckInPhase'
import DiscussPhase from 'server/graphql/types/DiscussPhase'
import GenericMeetingPhase from 'server/graphql/types/GenericMeetingPhase'
import NewMeetingPhaseTypeEnum from 'server/graphql/types/NewMeetingPhaseTypeEnum'
import NewMeetingStage from 'server/graphql/types/NewMeetingStage'
import ReflectPhase from 'server/graphql/types/ReflectPhase'
import UpdatesPhase from 'server/graphql/types/UpdatesPhase'
import {
  AGENDA_ITEMS,
  CHECKIN,
  DISCUSS,
  FIRST_CALL,
  GROUP,
  LAST_CALL,
  REFLECT,
  UPDATES,
  VOTE
} from 'universal/utils/constants'

export const newMeetingPhaseFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  meetingId: {
    type: new GraphQLNonNull(GraphQLID)
  },
  phaseType: {
    type: new GraphQLNonNull(NewMeetingPhaseTypeEnum),
    description: 'The type of phase'
  },
  stages: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NewMeetingStage)))
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
  [LAST_CALL]: GenericMeetingPhase
}

const NewMeetingPhase = new GraphQLInterfaceType({
  name: 'NewMeetingPhase',
  fields: newMeetingPhaseFields,
  resolveType: ({phaseType}) => resolveTypeLookup[phaseType]
})

export default NewMeetingPhase
