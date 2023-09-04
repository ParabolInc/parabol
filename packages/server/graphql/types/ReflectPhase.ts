import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import RetrospectivePrompt from '../../database/types/RetrospectivePrompt'
import getKysely from '../../postgres/getKysely'
import {GQLContext} from '../graphql'
import {resolveGQLStagesFromPhase} from '../resolvers'
import GenericMeetingStage from './GenericMeetingStage'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'
import ReflectPrompt from './ReflectPrompt'

const ReflectPhase = new GraphQLObjectType<any, GQLContext>({
  name: 'ReflectPhase',
  description: 'The meeting phase where all team members check in one-by-one',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    focusedPromptId: {
      type: GraphQLID,
      description: 'foreign key. use focusedPrompt'
    },
    focusedPrompt: {
      type: ReflectPrompt,
      description: 'the Prompt that the facilitator wants the group to focus on',
      resolve: (
        {focusedPromptId}: {focusedPromptId: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        return dataLoader.get('reflectPrompts').load(focusedPromptId)
      }
    },
    reflectPrompts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReflectPrompt))),
      description: 'The prompts used during the reflect phase',
      resolve: async (
        {id, teamId, meetingId}: {teamId: string, meetingId: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        console.log('GEORG id', id)
        const pg = getKysely()
        const customPrompts = (await pg.selectFrom('RetrospectivePrompt').selectAll().where('promptId', '=', id).execute()).map((prompt) => ({
            ...prompt,
            id: `MeetingRetrospectivePrompt:${meetingId}:${prompt.id}`,
            teamId,
          }))

        const meeting = (await dataLoader
          .get('newMeetings')
          .load(meetingId)) as MeetingRetrospective
        const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(meeting.templateId)
        // only show prompts that were created before the meeting and
        // either have not been removed or they were removed after the meeting was created
        return prompts.filter(
          (prompt: RetrospectivePrompt) =>
            prompt.createdAt < meeting.createdAt &&
            (!prompt.removedAt || meeting.createdAt < prompt.removedAt)
        ).concat(customPrompts)
      }
    },
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GenericMeetingStage))),
      resolve: resolveGQLStagesFromPhase
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
})

export default ReflectPhase
