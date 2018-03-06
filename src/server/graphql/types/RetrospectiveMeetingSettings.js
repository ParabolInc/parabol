import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import CustomPhaseItem from 'server/graphql/types/CustomPhaseItem';
import {teamMeetingSettingsFields} from 'server/graphql/types/TeamMeetingSettings';
import {RETROSPECTIVE} from 'universal/utils/constants';

const RetrospectiveMeetingSettings = new GraphQLObjectType({
  name: 'RetrospectiveMeetingSettings',
  description: 'The retro-specific meeting settings',
  fields: () => ({
    ...teamMeetingSettingsFields(),
    phaseItems: {
      type: new GraphQLList(new GraphQLNonNull(CustomPhaseItem)),
      description: 'the team-specific questions to ask during a retro',
      resolve: async ({teamId}, args, {dataLoader}) => {
        const customPhaseItems = await dataLoader.get('customPhaseItemsByTeamId').load(teamId);
        return customPhaseItems.filter(({phaseItemType}) => phaseItemType === RETROSPECTIVE);
      }
    }
  })
});

export default RetrospectiveMeetingSettings;
