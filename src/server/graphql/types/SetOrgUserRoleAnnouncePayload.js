import {GraphQLObjectType} from 'graphql';
import SetOrgUserRolePayload, {setOrgUserRoleFields} from 'server/graphql/types/SetOrgUserRolePayload';

const SetOrgUserRoleAnnouncePayload = new GraphQLObjectType({
  name: 'SetOrgUserRoleAnnouncePayload',
  interfaces: () => [SetOrgUserRolePayload],
  fields: () => ({
    ...setOrgUserRoleFields
  })
});

export default SetOrgUserRoleAnnouncePayload;
