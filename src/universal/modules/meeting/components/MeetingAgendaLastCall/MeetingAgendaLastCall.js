import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';

import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';

const MeetingAgendaLastCall = (props) => {
  const {
    agendaItemCount,
    actionCount,
    endMeeting,
    projectCount,
    styles
  } = props;
  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="2rem">
          <MeetingPhaseHeading>Boom!</MeetingPhaseHeading>
          <Type align="center" bold family="serif" marginBottom="2.25rem" marginTop="2rem" scale="s5" colorPalette="black">
            We worked on <span className={css(styles.highlight)}>{agendaItemCount} Agenda Items </span>
            resulting in <span className={css(styles.highlight)}>{actionCount} Actions </span>
            and <span className={css(styles.highlight)}>{projectCount} projects</span>.
          </Type>
          <Type align="center" marginBottom="2.75rem" scale="s4" colorPalette="black">
            Anybody have <b><i>additional Agenda Items</i></b>?<br />
            If so, just press “<span className={css(styles.highlight)}><b>+</b></span>” or{' '}
            <span className={css(styles.highlight)}>add another Agenda Item</span>.<br />
            If not, you can end the meeting to see a summary.
          </Type>
          <Button
            colorPalette="cool"
            label="End Meeting"
            onClick={endMeeting}
            size="largest"
            style="outlined"
          />
        </MeetingSection>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingAgendaLastCall.propTypes = {
  agendaItemCount: PropTypes.number,
  actionCount: PropTypes.number,
  projectCount: PropTypes.number,
  localPhaseItem: PropTypes.number,
  isFacilitating: PropTypes.bool,
  router: PropTypes.object.isRequired,
  styles: PropTypes.object,
  team: PropTypes.object
};

const styleThunk = () => ({
  highlight: {
    color: appTheme.palette.warm
  }
});

export default withStyles(styleThunk)(MeetingAgendaLastCall);
