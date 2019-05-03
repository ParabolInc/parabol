import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import AgendaItemsPhase from 'server/graphql/types/AgendaItemsPhase'
import UpdatesPhase from 'server/graphql/types/UpdatesPhase'
import {
  CHECKIN,
  DISCUSS,
  GROUP,
  REFLECT,
  VOTE,
  UPDATES,
  FIRST_CALL,
  AGENDA_ITEMS,
  LAST_CALL
} from 'universal/utils/constants'
import NewMeetingPhaseTypeEnum from 'server/graphql/types/NewMeetingPhaseTypeEnum'
import CheckInPhase from 'server/graphql/types/CheckInPhase'
import GenericMeetingPhase from 'server/graphql/types/GenericMeetingPhase'
import ReflectPhase from 'server/graphql/types/ReflectPhase'
import DiscussPhase from 'server/graphql/types/DiscussPhase'
import NewMeetingStage from 'server/graphql/types/NewMeetingStage'

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
    // this is really cool. GraphQL lets us keep stages set an an array of an abstract type here
    // and in concrete types like CheckINPhase, we can redefine it as an array of concrete types
    // this makes for much prettier graphql queries
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
