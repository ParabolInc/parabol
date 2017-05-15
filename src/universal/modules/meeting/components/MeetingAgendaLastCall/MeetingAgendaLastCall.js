import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import plural from 'universal/utils/plural';
import Button from 'universal/components/Button/Button';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';
import Type from 'universal/components/Type/Type';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import AgendaShortcutHint from 'universal/modules/meeting/components/AgendaShortcutHint/AgendaShortcutHint';

const MeetingAgendaLastCall = (props) => {
  const {
    agendaItemCount,
    hideMoveMeetingControls,
    gotoNext,
    facilitatorName,
    styles
  } = props;

  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="2rem">
          <MeetingPhaseHeading>
            {agendaItemCount === 0 ?
              <span>{'No agenda items?'}</span> :
              <span>{'That wraps up the agenda!'}</span>
            }
          </MeetingPhaseHeading>
          {agendaItemCount === 0 ?
            <Type
              align="center"
              marginBottom="2.5rem"
              marginTop=".5rem"
              scale="s5"
              colorPalette="black"
            >
              <span>
                {'Looks like you didn’t process any agenda items.'}
                <br />
                {'You can add agenda items in the left sidebar before ending the meeting.'}
                <br />
                {'Simply tap on any items you create to process them.'}
              </span>
            </Type> :
            <Type
              align="center"
              bold
              marginBottom="2.5rem"
              marginTop=".5rem"
              scale="s5"
              colorPalette="black"
            >
              We worked on <span className={css(styles.highlight)}>{`${agendaItemCount} ${plural(agendaItemCount, 'Agenda Item')}`}</span>
              {'—need anything else?'}
            </Type>
          }

          <AgendaShortcutHint />

          {!hideMoveMeetingControls ?
            <div className={css(styles.buttonBlock)}>
              <Button
                buttonStyle="solid"
                colorPalette="cool"
                label="End Meeting"
                onClick={gotoNext}
                size="largest"
                raised
                textTransform="uppercase"
              />
            </div> :
            <div className={css(styles.warmHighlight)}>
              <Type align="center" scale="s4" colorPalette="black">
                <span className={css(styles.highlight)}>Waiting for <b>{facilitatorName}</b> to end the meeting<Ellipsis /></span>
              </Type>
            </div>
          }
        </MeetingSection>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingAgendaLastCall.propTypes = {
  agendaItemCount: PropTypes.number,
  gotoNext: PropTypes.func,
  facilitatorName: PropTypes.string,
  hideMoveMeetingControls: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  highlight: {
    color: appTheme.palette.warm
  },

  buttonBlock: {
    marginTop: '2.5rem'
  },

  warmHighlight: {
    backgroundColor: appTheme.palette.warm10l,
    borderRadius: '.25rem',
    marginTop: '2.5rem',
    padding: '.25rem 1rem'
  }
});

export default withStyles(styleThunk)(MeetingAgendaLastCall);
