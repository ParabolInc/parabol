import {GraphQLFloat, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import NewMeeting, {newMeetingFields} from 'server/graphql/types/NewMeeting';
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup';
import {resolveForSU} from 'server/graphql/resolvers';
import RetrospectiveMeetingSettings from 'server/graphql/types/RetrospectiveMeetingSettings';
import {RETROSPECTIVE} from 'universal/utils/constants';

const RetrospectiveMeeting = new GraphQLObjectType({
  name: 'RetrospectiveMeeting',
  interfaces: () => [NewMeeting],
  description: 'A retrospective meeting',
  fields: () => ({
    ...newMeetingFields(),
    autoGroupThreshold: {
      type: GraphQLFloat,
      description: 'the threshold used to achieve the autogroup. Useful for model tuning. Serves as a flag if autogroup was used.',
      resolve: resolveForSU('autoGroupThreshold')
    },
    reflectionGroups: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroReflectionGroup))),
      description: 'The grouped reflections',
      resolve: async ({id: meetingId}, args, {dataLoader}) => {
        const reflectionGroups = await dataLoader.get('retroReflectionGroupByMeetingId').load(meetingId);
        reflectionGroups.sort((a, b) => a.sortOrder < b.sortOrder ? -1 : 1);
        return reflectionGroups;
      }
    },
    settings: {
      type: new GraphQLNonNull(RetrospectiveMeetingSettings),
      description: 'The settings that govern the retrospective meeting',
      resolve: async ({id: meetingId}, args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId);
        const {teamId} = meeting;
        const allSettings = await dataLoader.get('meetingSettingsByTeamId').load(teamId);
        console.log('allSet', allSettings);
        return allSettings.find((settings) => settings.meetingType === RETROSPECTIVE);
      }
    },
    votesRemaining: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The votes remaining for the whole team',
      resolve: async ({id: meetingId}, args, {dataLoader}) => {
        const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId);
        return meetingMembers.reduce((sum, member) => sum + member.votesRemaining, 0);
      }
    }
    // reflections: {
    //   type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroReflection))),
    //   description: 'The reflections generated during the reflect phase of the retro',
    //   resolve: async ({id}, args, {dataLoader}) => {
    //     const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(id);
    //     reflections.sort((a, b) => a.sortOrder < b.sortOrder ? -1 : 1);
    //     return reflections;
    //   }
    // }
  })
});

export default RetrospectiveMeeting;
