import {GraphQLObjectType} from 'graphql';
import TeamMember from 'server/graphql/types/TeamMember';

const RequestFacilitatorPayload = new GraphQLObjectType({
  name: 'RequestFacilitatorPayload',
  fields: () => ({
    requestor: {
      type: TeamMember,
      description: 'The team member that wants to be the facilitator',
      resolve: ({requestorId}, args, {dataLoader}) => {
        return dataLoader.get('teamMembers').load(requestorId);
      }
    }
  })
});

export default RequestFacilitatorPayload;
