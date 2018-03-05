import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import AgendaShortcutHint from 'universal/modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import MeetingCopy from 'universal/modules/meeting/components/MeetingCopy/MeetingCopy';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import withStyles from 'universal/styles/withStyles';
import {AGENDA_ITEM_LABEL} from 'universal/utils/constants';
import plural from 'universal/utils/plural';

const MeetingAgendaLastCall = (props) => {
  const {
    team: {agendaItems},
    hideMoveMeetingControls,
    gotoNext,
    facilitatorName,
    styles
  } = props;
  const agendaItemCount = agendaItems.filter((item) => item.isComplete).length;
  const labelAgendaItems = plural(0, AGENDA_ITEM_LABEL);

  const hintName = hideMoveMeetingControls ? facilitatorName : 'you';

  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="2rem">
          <div className={css(styles.main)}>
            <MeetingPhaseHeading>
              {agendaItemCount === 0 ?
                <span>{`No ${labelAgendaItems}?`}</span> :
                <span>{'Last Call:'}</span>
              }
            </MeetingPhaseHeading>
            {agendaItemCount === 0 ?
              <MeetingCopy>
                <span>
                  {`Looks like you didn’t process any ${labelAgendaItems}.`}
                  <br />
                  {`You can add ${labelAgendaItems} in the left sidebar before ending the meeting.`}
                  <br />
                  {'Simply tap on any items you create to process them.'}
                </span>
              </MeetingCopy> :
              <MeetingCopy>
                {'We’ve worked on '}
                <b>{`${agendaItemCount} ${plural(agendaItemCount, AGENDA_ITEM_LABEL)}`}</b>
                {' so far—need anything else?'}
              </MeetingCopy>
            }

            <AgendaShortcutHint />

            <div className={css(styles.controlBlock)}>
              {!hideMoveMeetingControls &&
                <Button
                  aria-label="End Meeting"
                  buttonSize="large"
                  buttonStyle="solid"
                  colorPalette="warm"
                  depth={1}
                  label="End Action Meeting"
                  onClick={gotoNext}
                />
              }
            </div>
            <div className={css(styles.hintBlock)}>
              <MeetingFacilitationHint>
                {'Waiting for'} <b>{hintName}</b> {'to move on'}
              </MeetingFacilitationHint>
            </div>
          </div>
        </MeetingSection>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingAgendaLastCall.propTypes = {
  team: PropTypes.object.isRequired,
  gotoNext: PropTypes.func,
  facilitatorName: PropTypes.string,
  hideMoveMeetingControls: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  main: {
    paddingLeft: ui.meetingSplashGutter,
    width: '100%'
  },

  highlight: {
    fontWeight: 600
  },

  controlBlock: {
    margin: '0',
    padding: '2.25rem 0 1rem',
    width: '12rem'
  },

  warmHighlight: {
    backgroundColor: appTheme.palette.warm10l,
    borderRadius: '.25rem',
    marginTop: '2.5rem',
    padding: '.25rem 1rem'
  },

  hintBlock: {
    width: '100%'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(MeetingAgendaLastCall),
  graphql`
    fragment MeetingAgendaLastCall_team on Team {
      agendaItems {
        isComplete
      }
    }`
);
