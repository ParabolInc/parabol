import {GraphQLObjectType} from 'graphql';
import RemoveOrgUserPayload from 'server/graphql/types/RemoveOrgUserPayload';
import {removeTeamMemberFields} from 'server/graphql/types/RemoveTeamMemberPayload';

const RemoveOrgUserOtherPayload = new GraphQLObjectType({
  name: 'RemoveOrgUserOtherPayload',
  interfaces: () => [RemoveOrgUserPayload],
  fields: () => ({
    ...removeTeamMemberFields
  })
});

export default RemoveOrgUserOtherPayload;
