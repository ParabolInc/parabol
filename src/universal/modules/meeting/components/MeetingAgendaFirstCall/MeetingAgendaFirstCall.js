import PropTypes from 'prop-types';
import React from 'react';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import AgendaShortcutHint from 'universal/modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import {css} from 'aphrodite-local-styles/no-important';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants';

const MeetingAgendaFirstCall = (props) => {
  const {
    facilitatorName,
    gotoNext,
    hideMoveMeetingControls,
    styles
  } = props;
  const phaseName = actionMeeting.agendaitems.name;
  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="2rem">
          <div className={css(styles.main)}>

            <MeetingPhaseHeading>
              {'Now, what do you need?'}
            </MeetingPhaseHeading>

            <MeetingCopy>
              {`Time to add your ${AGENDA_ITEM_LABEL}s to the list.`}
            </MeetingCopy>

            <AgendaShortcutHint />

            <div className={css(styles.controlBlock)}>
              {!hideMoveMeetingControls ?
                <Button
                  colorPalette="warm"
                  icon="arrow-circle-right"
                  iconPlacement="right"
                  label={`Let’s begin: ${phaseName}`}
                  onClick={gotoNext}
                  buttonSize="large"
                /> :
                <MeetingFacilitationHint>
                  {'Waiting for'} <b>{facilitatorName}</b> {`to start the ${phaseName}`}
                </MeetingFacilitationHint>
              }
            </div>
          </div>
        </MeetingSection>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingAgendaFirstCall.propTypes = {
  facilitatorName: PropTypes.string.isRequired,
  gotoNext: PropTypes.func,
  hideMoveMeetingControls: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  main: {
    paddingLeft: ui.meetingSplashGutter,
    width: '100%'
  },

  highlight: {
    color: appTheme.palette.warm
  },

  controlBlock: {
    marginTop: '2.5rem'
  },

  warmHighlight: {
    backgroundColor: appTheme.palette.warm10l,
    borderRadius: '.25rem',
    marginTop: '2.5rem',
    padding: '.25rem 1rem'
  }
});

export default withStyles(styleThunk)(MeetingAgendaFirstCall);
