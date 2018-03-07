import {GraphQLSchema} from 'graphql';
import NotifyPromoteToOrgLeader from 'server/graphql/types/NotifyPromoteToOrgLeader';
import mutation from './rootMutation';
import query from './rootQuery';
import subscription from './rootSubscription';
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem';
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting';
import GenericMeetingPhase from 'server/graphql/types/GenericMeetingPhase';
import DiscussPhase from 'server/graphql/types/DiscussPhase';
import ThinkPhase from 'server/graphql/types/ThinkPhase';
import CheckInPhase from 'server/graphql/types/CheckInPhase';
import RetrospectiveMeetingSettings from 'server/graphql/types/RetrospectiveMeetingSettings';
import ActionMeetingSettings from 'server/graphql/types/ActionMeetingSettings';

export default new GraphQLSchema({
  query,
  mutation,
  subscription,
  types: [
    CheckInPhase,
    ThinkPhase,
    DiscussPhase,
    GenericMeetingPhase,
    NotifyPromoteToOrgLeader,
    RetroPhaseItem,
    RetrospectiveMeeting,
    RetrospectiveMeetingSettings,
    ActionMeetingSettings
  ]
});
