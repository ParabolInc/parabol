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
    <p>{'This is the Social Check-In.'}</p>
    <p>{'This is the Social Check-In.'}</p>
    <p>{'This is the Social Check-In.'}</p>
  </div>
);

const reflectHelpContent = (
  <div>
    <p>{'This is the Reflect phase.'}</p>
    <p>{'This is the Reflect phase.'}</p>
    <p>{'This is the Reflect phase.'}</p>
  </div>
);

const groupHelpContent = (
  <div>
    <p>{'This is the Theme phase.'}</p>
    <p>{'This is the Theme phase.'}</p>
    <p>{'This is the Theme phase.'}</p>
  </div>
);

const voteHelpContent = (
  <div>
    <p>{'This is the Vote phase.'}</p>
    <p>{'This is the Vote phase.'}</p>
    <p>{'This is the Vote phase.'}</p>
  </div>
);

const discussHelpContent = (
  <div>
    <p>{'This is the Discuss phase.'}</p>
    <p>{'This is the Discuss phase.'}</p>
    <p>{'This is the Discuss phase.'}</p>
  </div>
);

const updatesHelpContent = (
  <div>
    <p>{'This is the Solo Updates phase.'}</p>
    <p>{'This is the Solo Updates phase.'}</p>
    <p>{'This is the Solo Updates phase.'}</p>
  </div>
);

const firstCallHelpContent = (
  <div>
    <p>{'This is the First Call.'}</p>
    <p>{'This is the First Call.'}</p>
    <p>{'This is the First Call.'}</p>
  </div>
);

const agendaTopicHelpContent = (
  <div>
    <p>{'This is an Agenda Topic.'}</p>
    <p>{'This is an Agenda Topic.'}</p>
    <p>{'This is an Agenda Topic.'}</p>
  </div>
);

const lastCallHelpContent = (
  <div>
    <p>{'This is the Last Call.'}</p>
    <p>{'This is the Last Call.'}</p>
    <p>{'This is the Last Call.'}</p>
  </div>
);

const phaseHelpLookup = {
  [CHECKIN]: {
    facilitatorBarTip: 'Do this to guide your team through the Social Check-In',
    helpDialog: checkInHelpContent
  },
  [REFLECT]: {
    facilitatorBarTip: 'Do this to guide your team through the Reflect phase',
    helpDialog: reflectHelpContent
  },
  [GROUP]: {
    facilitatorBarTip: 'Do this to guide your team through the Group phase',
    helpDialog: groupHelpContent
  },
  [VOTE]: {
    facilitatorBarTip: 'Do this to guide your team through the Vote phase',
    helpDialog: voteHelpContent
  },
  [DISCUSS]: {
    facilitatorBarTip: 'Do this to guide your team through the Discuss phase',
    helpDialog: discussHelpContent
  },
  [UPDATES]: {
    facilitatorBarTip: 'Do this to guide your team through the Solo Updates phase',
    helpDialog: updatesHelpContent
  },
  [FIRST_CALL]: {
    facilitatorBarTip: 'Do this to get started with the Team Agenda',
    helpDialog: firstCallHelpContent
  },
  [AGENDA_ITEMS]: {
    facilitatorBarTip: 'Do this to process an Agenda Topic',
    helpDialog: agendaTopicHelpContent
  },
  [LAST_CALL]: {
    facilitatorBarTip: 'Do this to wrap up a meeting with your team',
    helpDialog: lastCallHelpContent
  }
};

export default phaseHelpLookup;
