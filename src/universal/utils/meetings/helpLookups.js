import React from 'react';

import {
  LOBBY,
  CHECKIN,
  REFLECT,
  GROUP,
  VOTE,
  DISCUSS,
  UPDATES,
  FIRST_CALL,
  AGENDA_ITEMS,
  LAST_CALL
} from 'universal/utils/constants';

const makeLink = (href, copy) => (
  <a href={href} rel="noopener noreferrer" target="blank" title={copy}>{copy}</a>
);

const teamAgendaHelpLink = makeLink('https://www.parabol.co/getting-started-guide#team-agenda', 'Learn More');

const actionGettingStartedLink = makeLink('https://www.parabol.co/getting-started-guide', 'Getting Started Guide');
// TODO: Add Learn More links, etc. for Retro Guide when it is created
const retroGettingStartedLink = makeLink('https://www.parabol.co/getting-started-guide', 'Getting Started Guide');

// TODO: Refactor to handle Retro type
const meetingLabel = 'an Action Meeting' || 'a Retro Meeting';
const meetingHelpLink = actionGettingStartedLink || retroGettingStartedLink;

const lobbyHelpContent = (
  <div>
    <p>{`To learn more about how to run ${meetingLabel}, see our `}{meetingHelpLink}{'.'}</p>
  </div>
);

const checkInHelpContent = (
  <div>
    <p>{'The Social Check-In is an opportunity to quickly share some personal context with your team.'}</p>
    <p>{'Avoid cross-talk so that everybody can have uninterrupted airtime.'}</p>
    <p>{makeLink('https://www.parabol.co/getting-started-guide#social-check-in', 'Learn More')}</p>
  </div>
);

const reflectHelpContent = (
  <div>
    <p>{'The goal of this phase is to gather honest input from the team.'}</p>
    <p>{'As a group, reflect on projects for a specific timeframe.'}</p>
    <p>{'Reflection cards will remain blurred from other teammates until everyone has completed the phase.'}</p>
  </div>
);

const groupHelpContent = (
  <div>
    <p>{'The goal of this phase is to identify common themes and group them for discussion.'}</p>
    <p>{'To group, simply drag and drop a card onto another card or group.'}</p>
    <p>{'Tap or hover a single card to give it a theme.'}</p>
  </div>
);

const voteHelpContent = (
  <div>
    <p>{'The goal of this phase is to find signal on what topics are the most important to the team.'}</p>
    <p>{'Each teammate has 5 total votes, and can vote on a single theme up to 3 times.'}</p>
    <p>{'To vote, simply tap on the check icon above the card. Toggle votes to remove.'}</p>
  </div>
);

const discussHelpContent = (
  <div>
    <p>{'The goal of this phase is to identify next steps and capture them as task cards assigned to an owner.'}</p>
    <p>{'Sometimes the next task is to schedule a time to discuss a topic more in depth at a later time.'}</p>
  </div>
);

const updatesHelpContent = (
  <div>
    <p>{'During this phase each teammate has uninterrupted airtime to give an update on their work.'}</p>
    <p>{'Help keep your team on schedule by adding Agenda topics to the queue if updates inspire the need for discussion.'}</p>
    <p>{makeLink('https://www.parabol.co/getting-started-guide#solo-updates', 'Learn More')}</p>
  </div>
);

const firstCallHelpContent = (
  <div>
    <p>{'Time to add any remaining Agenda topics for discussion!'}</p>
    <p>{'You can contribute to the Agenda any time: before a meeting begins, or during a meeting.'}</p>
    <p>{'For those that like keyboard shortcuts, you can simply press the “+” key to add.'}</p>
    <p>{teamAgendaHelpLink}</p>
  </div>
);

const agendaTopicHelpContent = (
  <div>
    <p>{'The goal of this phase is to identify next steps and capture them as task cards assigned to an owner.'}</p>
    <p>{'Sometimes the next task is to schedule a time to discuss a topic more in depth at a later time.'}</p>
    <p>{teamAgendaHelpLink}</p>
  </div>
);

const lastCallHelpContent = (
  <div>
    <p>{'Here’s a chance to add any last topics for discussion.'}</p>
    <p>{'A Meeting Summary will be generated once the Facilitator ends the meeting.'}</p>
    <p>{teamAgendaHelpLink}</p>
  </div>
);

const phaseHelpLookup = {
  [LOBBY]: {
    facilitatorBarTip: null,
    helpDialog: lobbyHelpContent
  },
  [CHECKIN]: {
    facilitatorBarTip: 'Facilitator: allow each teammate a moment to answer today’s prompt, then mark them as Here or Not Here.',
    helpDialog: checkInHelpContent
  },
  [REFLECT]: {
    facilitatorBarTip: 'Facilitator: depending on preference, your team can focus on 1 prompt at a time, or both.',
    helpDialog: reflectHelpContent
  },
  [GROUP]: {
    facilitatorBarTip: 'Facilitator: have teammates ask clarifying questions as they group reflections.',
    helpDialog: groupHelpContent
  },
  [VOTE]: {
    facilitatorBarTip: 'Facilitator: only 1 vote is required to move forward.',
    helpDialog: voteHelpContent
  },
  [DISCUSS]: {
    // eslint-disable-next-line max-len
    facilitatorBarTip: 'Facilitator: encourage your team to break tasks down to their smallest components, perhaps owned by multiple teammates.',
    helpDialog: discussHelpContent
  },
  [UPDATES]: {
    facilitatorBarTip: 'Facilitator: encourage teammates to add Agenda topics rather than interrupting solo updates with discussion.',
    helpDialog: updatesHelpContent
  },
  [FIRST_CALL]: {
    facilitatorBarTip: 'Facilitator: give teammates a moment to add last-minute topics to the list.',
    helpDialog: firstCallHelpContent
  },
  [AGENDA_ITEMS]: {
    facilitatorBarTip: 'Facilitator: encourage teammates to create a task to discuss a topic later if next steps are not clear.',
    helpDialog: agendaTopicHelpContent
  },
  [LAST_CALL]: {
    facilitatorBarTip: 'Facilitator: remember to end the meeting!',
    helpDialog: lastCallHelpContent
  }
};

export default phaseHelpLookup;
