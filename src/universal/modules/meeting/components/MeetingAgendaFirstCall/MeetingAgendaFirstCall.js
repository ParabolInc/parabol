import React, {PropTypes} from 'react';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';

const MeetingAgendaFirstCall = (props) => {
  const {gotoNext} = props;
  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="2rem">
          <MeetingPhaseHeading>Whatcha need?</MeetingPhaseHeading>
          <Type align="center" bold marginTop="2rem" scale="s5" colorPalette="black">
            Add your Agenda Items to the queue now…
          </Type>
          <IconLink
            colorPalette="cool"
            icon="arrow-circle-right"
            iconPlacement="right"
            label="…great! Let’s take care of our Agenda Items"
            scale="large"
            colorPalette="cool"
            onClick={gotoNext}
            margin="2rem 0 0"
          />
        </MeetingSection>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingAgendaFirstCall.propTypes = {
  gotoNext: PropTypes.func
};

export default MeetingAgendaFirstCall;
