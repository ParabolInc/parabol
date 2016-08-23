import React, {PropTypes} from 'react';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';

import ShortcutsToggle from 'universal/modules/team/components/ShortcutsToggle/ShortcutsToggle';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';

const MeetingAgendaFirstCall = (props) => {
  return (
    <MeetingLayout>
      <MeetingMain>
        <MeetingSection flexToFill paddingBottom="2rem">
          <MeetingSection paddingBottom="2rem">
            <MeetingPhaseHeading>Whatcha need?</MeetingPhaseHeading>
            <Type align="center" bold marginTop="2rem" scale="s5" theme="black">
              Add your Agenda Items to the queue now…
            </Type>
            <IconLink
              icon="arrow-circle-right"
              iconPlacement="right"
              label="…great! Let’s take care of our Agenda Items"
              scale="large"
            />
          </MeetingSection>
        </MeetingSection>
      </MeetingMain>
      <ShortcutsToggle />
    </MeetingLayout>
  );
};
export default MeetingAgendaFirstCall;
