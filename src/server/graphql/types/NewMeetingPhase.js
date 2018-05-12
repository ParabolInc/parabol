import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import {CHECKIN, DISCUSS, GROUP, REFLECT, VOTE} from 'universal/utils/constants'
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
  phaseType: {
    type: NewMeetingPhaseTypeEnum,
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
  [DISCUSS]: DiscussPhase
}

const NewMeetingPhase = new GraphQLInterfaceType({
  name: 'NewMeetingPhase',
  fields: newMeetingPhaseFields,
  resolveType: ({phaseType}) => resolveTypeLookup[phaseType]
})

export default NewMeetingPhase
