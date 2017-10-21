import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString} from 'graphql';
import {globalIdField} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import {Team} from '../models/Team/teamSchema';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import User from 'server/graphql/types/User';
import Project from 'server/graphql/types/Project';

const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team team',
  fields: () => ({
    id: globalIdField('TeamMember', ({id}) => id),
    // id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team member ID'},
    isNotRemoved: {
      type: GraphQLBoolean,
      description: 'true if the user is a part of the team, false if they no longer are'
    },
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'},
    hideAgenda: {
      type: GraphQLBoolean,
      description: 'hide the agenda list on the dashboard'
    },
    /* denormalized from User */
    email: {
      type: GraphQLEmailType,
      description: 'The user email'
    },
    picture: {
      type: GraphQLURLType,
      description: 'url of user’s profile picture'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    },
    /* Ephemeral meeting state */
    checkInOrder: {
      type: GraphQLInt,
      description: 'The place in line for checkIn, regenerated every meeting'
    },
    isCheckedIn: {
      type: GraphQLBoolean,
      description: 'true if present, false if absent, null before check-in'
    },
    /* Foreign keys */
    teamId: {
      type: GraphQLID,
      description: 'foreign key to Team table'
    },
    userId: {
      type: GraphQLID,
      description: 'foreign key to User table'
    },
    /* GraphQL sugar */
    team: {
      type: Team,
      description: 'The team this team member belongs to',
      resolve({teamId}) {
        const r = getRethink();
        return r.table('Team')
          .get(teamId)
          .run();
      }
    },
    user: {
      type: User,
      description: 'The user for the team member',
      resolve(source) {
        const r = getRethink();
        return r.table('User')
          .get(source.userId)
          .run();
      }
    },
    projects: {
      type: Project,
      description: 'Projects owned by the team member',
      resolve(source) {
        const r = getRethink();
        return r.table('Project')
          .getAll(source.id, {index: 'teamMemberId'})
          .run();
      }
    }
  })
});

export default TeamMember;
