import MeetingLobbyLayout from 'universal/modules/meetingLayout/containers/MeetingLobbyLayout/MeetingLobbyLayout';
import MeetingUpdatesLayout from 'universal/modules/meetingLayout/containers/MeetingUpdatesLayout/MeetingUpdatesLayout';
// eslint-disable-next-line max-len
import MeetingRequestsLayout from 'universal/modules/meetingLayout/containers/MeetingRequestsLayout/MeetingRequestsLayout';
// eslint-disable-next-line max-len
import MeetingAgendaLastCall from 'universal/modules/meetingLayout/containers/MeetingAgendaLastCall/MeetingAgendaLastCall';
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
    path: '/meetingLayout/updates',
    component: MeetingUpdatesLayout
  },
  {
    path: '/meetingLayout/requests',
    component: MeetingRequestsLayout
  },
  {
    path: '/meetingLayout/lastCall',
    component: MeetingAgendaLastCall
  },
  {
    path: '/meetingLayout/summary',
    component: MeetingSummaryLayout
  }
]);
