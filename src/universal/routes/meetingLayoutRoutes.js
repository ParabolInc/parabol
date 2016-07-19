import MeetingLobbyLayout from 'universal/modules/meetingLayout/containers/MeetingLobbyLayout/MeetingLobbyLayout';
import MeetingCheckinLayout from 'universal/modules/meetingLayout/containers/MeetingCheckinLayout/MeetingCheckinLayout';

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
  }
]);
