import React, {PropTypes} from 'react';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';
import withStyles from 'universal/styles/withStyles';
import appTheme from 'universal/styles/theme/appTheme';
import {css} from 'aphrodite-local-styles/no-important';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';

const MeetingAgendaFirstCall = (props) => {
  const {
    gotoNext,
    team,
    members,
    hideMoveMeetingControls,
    styles
  } = props;
  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="2rem">
          <MeetingPhaseHeading>Whatcha need?</MeetingPhaseHeading>
          <Type align="center" bold marginBottom="2rem" marginTop="2rem" scale="s5" colorPalette="black">
            Add your Agenda Items to the queue now…
          </Type>
          {!hideMoveMeetingControls ?
            <Button
              buttonStyle="flat"
              colorPalette="cool"
              icon="arrow-circle-right"
              iconPlacement="right"
              label="…great! Let’s take care of our Agenda Items"
              onClick={gotoNext}
              size="medium"
            /> :
            <div className={css(styles.warmHighlight)}>
              <Type align="center" scale="s4" colorPalette="black">
                <span className={css(styles.highlight)}>
                  Waiting for <b>{getFacilitatorName(team, members)}</b> to advance the meeting<Ellipsis />
                </span>
              </Type>
            </div>
          }
        </MeetingSection>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingAgendaFirstCall.propTypes = {
  gotoNext: PropTypes.func,
  hideMoveMeetingControls: PropTypes.bool,
  styles: PropTypes.object,
  team: PropTypes.object,
  members: PropTypes.array
};

const styleThunk = () => ({
  highlight: {
    color: appTheme.palette.warm
  },

  warmHighlight: {
    backgroundColor: appTheme.palette.warm10l,
    borderRadius: '.25rem',
    padding: '.25rem 1rem'
  }
});

export default withStyles(styleThunk)(MeetingAgendaFirstCall);
