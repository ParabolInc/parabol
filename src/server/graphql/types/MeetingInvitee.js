import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import MeetingProject from 'server/graphql/types/MeetingProject';
import TeamMember from 'server/graphql/types/TeamMember';


const MeetingInvitee = new GraphQLObjectType({
  name: 'MeetingInvitee',
  description: 'The user invited to the meeting',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'The teamMemberId of the user invited to the meeting'
    },
    present: {
      type: GraphQLBoolean,
      description: 'true if the invitee was present in the meeting'
    },
    /* RethinkDB sugar */
    projects: {
      type: new GraphQLList(MeetingProject),
      description: 'A list of immutable projects, as they were created in the meeting'
    },
    picture: {
      type: GraphQLURLType,
      description: 'url of user’s profile picture'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    },
    /* GraphQL Sugar */
    membership: {
      type: TeamMember,
      description: 'All of the fields from the team member table',
      resolve({id}) {
        const r = getRethink();
        return r.table('TeamMember')
          .get(id)
          .run();
      }
    }
  })
});

export default MeetingInvitee;
