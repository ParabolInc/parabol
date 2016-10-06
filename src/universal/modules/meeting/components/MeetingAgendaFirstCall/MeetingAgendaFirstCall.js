import React, {PropTypes} from 'react';
import {withRouter} from 'react-router';
import {FIRST_CALL} from 'universal/utils/constants';
import makePhaseItemFactory from 'universal/modules/meeting/helpers/makePhaseItemFactory';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';

const MeetingAgendaFirstCall = (props) => {
  const {
    isFacilitating,
    router,
    team
  } = props;
  const {id: teamId} = team;
  const phaseItemFactory = makePhaseItemFactory(isFacilitating, 0, router, teamId, FIRST_CALL);
  const gotoNextItem = phaseItemFactory(1);

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
            onClick={gotoNextItem}
            margin="2rem 0 0"
            scale="large"
          />
        </MeetingSection>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingAgendaFirstCall.propTypes = {
  localPhaseItem: PropTypes.number,
  isFacilitating: PropTypes.bool,
  router: PropTypes.object.isRequired,
  team: PropTypes.object
};
export default withRouter(MeetingAgendaFirstCall);
