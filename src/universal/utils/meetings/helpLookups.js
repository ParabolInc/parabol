import React from 'react';

import {
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

const checkInHelpContent = (
  <div>
    <p>{'The Social Check-In is an opportunity to quickly share some personal context with your team.'}</p>
    <p>{'Avoid cross-talk so that everybody can have uninterrupted airtime.'}</p>
  </div>
);

const reflectHelpContent = (
  <div>
    <p>{'Reflection cards are anonymous.'}</p>
    <p>{'Cards from the team are blurred until it’s time to group and add themes.'}</p>
    <p>{'The goal is to gather honest input from the team.'}</p>
  </div>
);

const groupHelpContent = (
  <div>
    <p>{'This is the Theme phase. The goal is to identify common themes and group accordingly.'}</p>
    <p>{'To group, simply drag and drop a card onto another card or group.'}</p>
    <p>{'Tap or hover a single card to give it a theme.'}</p>
  </div>
);

const voteHelpContent = (
  <div>
    <p>{'This is the Vote phase. The goal is to get signal on what topics need the most attention from the team.'}</p>
    <p>{'Each teammate has 5 total votes, and can vote on a single theme up to 3 times.'}</p>
    <p>{'To vote, simply tap on the check icon above the card. Toggle votes to remove.'}</p>
  </div>
);

const discussHelpContent = (
  <div>
    <p>{'This is the Discuss phase. The goal is to identify next steps and capture those as a task with an owner.'}</p>
    <p>{'Sometimes the next task is to schedule a time to discuss a topic more in depth at a later time.'}</p>
  </div>
);

const updatesHelpContent = (
  <div>
    <p>{'This is the Solo Updates phase. Each teammate has a moment to give an update on their tasks.'}</p>
    <p>{'In order to hear from everyone quickly, add agenda items as updates trigger the need for discussion.'}</p>
  </div>
);

const firstCallHelpContent = (
  <div>
    <p>{'Time to add any remaining Agenda Topics for discussion!'}</p>
    <p>{'The team can build the Agenda anytime: before a meeting begins, or during the meeting.'}</p>
    <p>{'For those that like keyboard shortcuts, you can simply press the + key to add.'}</p>
  </div>
);

const agendaTopicHelpContent = (
  <div>
    <p>{'This is an Agenda Topic. The goal is to identify next steps and capture those as a task with an owner.'}</p>
    <p>{'Sometimes the next task is to schedule a time to discuss a topic more in depth at a later time.'}</p>
  </div>
);

const lastCallHelpContent = (
  <div>
    <p>{'Here’s a chance to add any last topics for discussion.'}</p>
    <p>{'A Meeting Summary will be generated once the Facilitator ends the meeting.'}</p>
  </div>
);

const phaseHelpLookup = {
  [CHECKIN]: {
    facilitatorBarTip: 'Allow each teammate a moment to answer today’s prompt, then mark them as Here or Not Here.',
    helpDialog: checkInHelpContent
  },
  [REFLECT]: {
    facilitatorBarTip: 'Ask your team to focus on 1 prompt at a time, or both, depending on preference.',
    helpDialog: reflectHelpContent
  },
  [GROUP]: {
    facilitatorBarTip: 'Have teammates ask clarifying questions as they group reflections.',
    helpDialog: groupHelpContent
  },
  [VOTE]: {
    facilitatorBarTip: '',
    helpDialog: voteHelpContent
  },
  [DISCUSS]: {
    facilitatorBarTip: 'Encourage teammates to create a task to discuss a topic later if next steps are not clear.',
    helpDialog: discussHelpContent
  },
  [UPDATES]: {
    facilitatorBarTip: 'Encourage teammates to add agenda items and avoid discussion as teammates give their updates.',
    helpDialog: updatesHelpContent
  },
  [FIRST_CALL]: {
    facilitatorBarTip: 'Give teammates a moment to add last-minute topics to the list.',
    helpDialog: firstCallHelpContent
  },
  [AGENDA_ITEMS]: {
    facilitatorBarTip: 'Encourage teammates to create a task to discuss a topic later if next steps are not clear.',
    helpDialog: agendaTopicHelpContent
  },
  [LAST_CALL]: {
    facilitatorBarTip: 'Remember to end the meeting!',
    helpDialog: lastCallHelpContent
  }
};

export default phaseHelpLookup;
