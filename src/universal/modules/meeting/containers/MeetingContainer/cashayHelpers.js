import subscriptions from '../../../../subscriptions/subscriptions';
import {TEAM, TEAM_MEMBERS} from '../../../../subscriptions/constants';

export const teamSubString = subscriptions.find(sub => sub.channel === TEAM).string;
export const teamMembersSubString = subscriptions.find(sub => sub.channel === TEAM_MEMBERS).string;
