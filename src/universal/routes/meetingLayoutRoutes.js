import MeetingLobbyLayout from 'universal/modules/meetingLayout/containers/MeetingLobbyLayout/MeetingLobbyLayout';
import MeetingCheckinLayout from 'universal/modules/meetingLayout/containers/MeetingCheckinLayout/MeetingCheckinLayout';
import MeetingUpdatesLayout from 'universal/modules/meetingLayout/containers/MeetingUpdatesLayout/MeetingUpdatesLayout';

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
  }
]);
