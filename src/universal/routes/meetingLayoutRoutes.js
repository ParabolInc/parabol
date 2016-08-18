import MeetingLobbyLayout from 'universal/modules/meetingLayout/containers/MeetingLobbyLayout/MeetingLobbyLayout';
import MeetingCheckinLayout from 'universal/modules/meetingLayout/containers/MeetingCheckinLayout/MeetingCheckinLayout';
import MeetingUpdatesLayout from 'universal/modules/meetingLayout/containers/MeetingUpdatesLayout/MeetingUpdatesLayout';
// eslint-disable-next-line max-len
import MeetingRequestsLayout from 'universal/modules/meetingLayout/containers/MeetingRequestsLayout/MeetingRequestsLayout';
// eslint-disable-next-line max-len
import MeetingAgendaFirstCall from 'universal/modules/meetingLayout/containers/MeetingAgendaFirstCall/MeetingAgendaFirstCall';
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
    path: '/meetingLayout/firstCall',
    component: MeetingAgendaFirstCall
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
