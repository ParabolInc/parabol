import React, {PropTypes} from 'react';
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
import getWeekOfYear from 'universal/utils/getWeekOfYear';
import {makeSuccessExpression} from 'universal/utils/makeSuccessCopy';

const MeetingAgendaLastCall = (props) => {
  const {
    agendaItemCount,
    hideMoveMeetingControls,
    gotoNext,
    facilitatorName,
    styles
  } = props;

  const now = new Date();
  const week = getWeekOfYear(now);

  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="2rem">
          <MeetingPhaseHeading>
            {/* Add 2 to week number to make expression different from Summary */}
            {makeSuccessExpression(week + 2)}!
          </MeetingPhaseHeading>
          <Type
            align="center"
            bold
            marginBottom="2rem"
            scale="s5"
            colorPalette="black"
          >
            We worked on <span className={css(styles.highlight)}>{`${agendaItemCount} ${plural(agendaItemCount, 'Agenda Item')}`}</span>
            —any additional items?
          </Type>

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
    marginTop: '2rem'
  },

  warmHighlight: {
    backgroundColor: appTheme.palette.warm10l,
    borderRadius: '.25rem',
    marginTop: '2rem',
    padding: '.25rem 1rem'
  }
});

export default withStyles(styleThunk)(MeetingAgendaLastCall);
