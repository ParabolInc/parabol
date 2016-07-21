import MeetingLobbyLayout from 'universal/modules/meetingLayout/containers/MeetingLobbyLayout/MeetingLobbyLayout';
import MeetingCheckinLayout from 'universal/modules/meetingLayout/containers/MeetingCheckinLayout/MeetingCheckinLayout';
import MeetingUpdatesLayout from 'universal/modules/meetingLayout/containers/MeetingUpdatesLayout/MeetingUpdatesLayout';
// eslint-disable-next-line max-len
import MeetingRequestsLayout from 'universal/modules/meetingLayout/containers/MeetingRequestsLayout/MeetingRequestsLayout';
import MeetingSummaryLayout from 'universal/modules/meetingLayout/containers/MeetingSummaryLayout/MeetingSummaryLayout';

export default ([
  {
    path: '/meetingLayout',
    component: MeetingLobbyLayout
  },
  {
    path: '/meetingLayout/lobby',
    component: MeetingLobbyLayout
  },
  {
    path: '/meetingLayout/checkin',
    component: MeetingCheckinLayout
  },
  {
    path: '/meetingLayout/updates',
    component: MeetingUpdatesLayout
  },
  {
    path: '/meetingLayout/requests',
    component: MeetingRequestsLayout
  },
  {
    path: '/meetingLayout/summary',
    component: MeetingSummaryLayout
  }
]);
