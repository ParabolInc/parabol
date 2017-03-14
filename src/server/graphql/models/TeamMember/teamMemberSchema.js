import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
} from 'graphql';
import {GraphQLEmailType, GraphQLURLType} from '../../types';
import {Team} from '../Team/teamSchema';
import {User} from '../User/userSchema';
import {Project} from '../Project/projectSchema';
import getRethink from 'server/database/rethinkDriver';

const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team member ID'},
    isNotRemoved: {type: GraphQLBoolean, description: 'true if the user is a part of the team, false if they no longer are'},
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'},
    /* denormalized from User */
    email: {
      type: GraphQLEmailType,
      description: 'The user email'
    },
    picture: {
      type: GraphQLURLType,
      description: 'url of user\'s profile picture'
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
        return r.table('Team').get(teamId);
      }
    },
    user: {
      type: User,
      description: 'The user for the team member',
      resolve(source) {
        const r = getRethink();
        return r.table('User').get(source.userId);
      }
    },
    projects: {
      type: Project,
      description: 'Projects owned by the team member',
      resolve(source) {
        const r = getRethink();
        return r.table('Project').getAll(source.id, {index: 'teamMemberId'});
      }
    }
  })
});

export default TeamMember;
