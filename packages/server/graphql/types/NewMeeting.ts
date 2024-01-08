import {GraphQLInterfaceType} from 'graphql'
import {MeetingTypeEnum as MeetingTypeEnumType} from '../../postgres/types/Meeting'
import ActionMeeting from './ActionMeeting'
import PokerMeeting from './PokerMeeting'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import TeamPromptMeeting from './TeamPromptMeeting'

// scaffolding until all types using this are migrated to codegen
const NewMeeting: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'NewMeeting',
  description: 'A team meeting history for all previous meetings',
  fields: {},
  resolveType: ({meetingType}: {meetingType: MeetingTypeEnumType}) => {
    const resolveTypeLookup = {
      retrospective: RetrospectiveMeeting,
      action: ActionMeeting,
      poker: PokerMeeting,
      teamPrompt: TeamPromptMeeting
    } as const
    return resolveTypeLookup[meetingType as keyof typeof resolveTypeLookup]
  }
})

export default NewMeeting
