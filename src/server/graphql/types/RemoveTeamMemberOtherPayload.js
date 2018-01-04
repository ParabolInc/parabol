import {GraphQLObjectType} from 'graphql';
import RemoveTeamMemberPayload, {removeTeamMemberFields} from 'server/graphql/types/RemoveTeamMemberPayload';

const RemoveTeamMemberOtherPayload = new GraphQLObjectType({
  name: 'RemoveTeamMemberOtherPayload',
  interfaces: () => [RemoveTeamMemberPayload],
  fields: () => ({
    ...removeTeamMemberFields
  })
});

export default RemoveTeamMemberOtherPayload;
