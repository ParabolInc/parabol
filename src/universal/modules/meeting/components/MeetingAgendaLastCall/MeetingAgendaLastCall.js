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
import getWeekOfYear from 'universal/utils/getWeekOfYear';
import {makeSuccessExpression} from 'universal/utils/makeSuccessCopy';

const MeetingAgendaLastCall = (props) => {
  const {
    agendaItemCount,
    actionCount,
    isFacilitating,
    gotoNext,
    facilitatorName,
    projectCount,
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
            family="serif"
            marginBottom="2.25rem"
            marginTop="2rem"
            scale="s5"
            colorPalette="black"
          >
            We worked on <span className={css(styles.highlight)}>{`${agendaItemCount} ${plural(agendaItemCount, 'Agenda Item')} `}</span>
            resulting in <span className={css(styles.highlight)}>{`${actionCount} ${plural(actionCount, 'Action')} `}</span>
            and <span className={css(styles.highlight)}>{`${projectCount} ${plural(projectCount, 'Project')}`}</span>.
          </Type>
          <Type align="center" marginBottom="2.75rem" scale="s4" colorPalette="black">
            Anybody have <b><i>additional Agenda Items</i></b>?<br />
            If so, just press “<span className={css(styles.highlight)}><b>+</b></span>” or{' '}
            <span className={css(styles.highlight)}>add another Agenda Item</span>.<br />
            If not, you can end the meeting to see a summary.
          </Type>
          {isFacilitating ?
            <Button
              colorPalette="cool"
              label="End Meeting"
              onClick={gotoNext}
              size="largest"
              buttonStyle="solid"
              textTransform="uppercase"
            /> :
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
  actionCount: PropTypes.number,
  gotoNext: PropTypes.func,
  facilitatorName: PropTypes.string,
  localPhaseItem: PropTypes.number,
  isFacilitating: PropTypes.bool,
  projectCount: PropTypes.number,
  styles: PropTypes.object,
  team: PropTypes.object
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

export default withStyles(styleThunk)(MeetingAgendaLastCall);
