import React from 'react';
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy';
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants';

const AgendaShortcutHint = () => {
  return (
    <MeetingCopy>
      {'Press “'}<b>{'+'}</b>{`” to add an ${AGENDA_ITEM_LABEL} to the left column.`}
    </MeetingCopy>
  );
};

export default AgendaShortcutHint;
