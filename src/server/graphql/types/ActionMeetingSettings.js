import {GraphQLObjectType} from 'graphql';
import {teamMeetingSettingsFields} from 'server/graphql/types/TeamMeetingSettings';


const ActionMeetingSettings = new GraphQLObjectType({
  name: 'ActionMeetingSettings',
  description: 'The action-specific meeting settings',
  fields: () => ({
    ...teamMeetingSettingsFields()
  })
});

export default ActionMeetingSettings;
