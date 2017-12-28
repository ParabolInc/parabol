import makeSubscriptionPayload from 'server/graphql/makeSubscriptionPayload';
import {resolveTeamMember} from 'server/graphql/resolvers';
import TeamMember from 'server/graphql/types/TeamMember';

const TeamMemberSubscriptionPayload = makeSubscriptionPayload(TeamMember, resolveTeamMember);

export default TeamMemberSubscriptionPayload;
