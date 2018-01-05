import {GraphQLObjectType} from 'graphql';
import SetOrgUserRolePayload, {setOrgUserRoleFields} from 'server/graphql/types/SetOrgUserRolePayload';

const SetOrgUserRoleAnnoucePayload = new GraphQLObjectType({
  name: 'SetOrgUserRoleAnnoucePayload',
  interfaces: () => [SetOrgUserRolePayload],
  fields: () => ({
    ...setOrgUserRoleFields
  })
});

export default SetOrgUserRoleAnnoucePayload;
