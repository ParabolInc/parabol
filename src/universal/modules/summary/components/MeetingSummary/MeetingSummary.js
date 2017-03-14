import React, {PropTypes} from 'react';
import Helmet from 'react-helmet';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {Link} from 'react-router';
import appTheme from 'universal/styles/theme/appTheme';

import Type from 'universal/components/Type/Type';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import SummaryEmailPreview from 'universal/modules/meeting/components/SummaryEmailPreview/SummaryEmailPreview';
import SummaryFirstTime from 'universal/modules/meeting/components/SummaryFirstTime/SummaryFirstTime';
import SummaryQuickStats from 'universal/modules/meeting/components/SummaryQuickStats/SummaryQuickStats';
import {makeSuccessExpression} from 'universal/utils/makeSuccessCopy';

const MeetingSummary = (props) => {
  const {
    actionCount,
    agendaItemsCompleted,
    meetingNumber,
    projectCount,
    styles,
    teamId,
    teamMembers,
    teamName,
    title
  } = props;
  return (
    <MeetingMain>
      <Helmet title={title} />
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="4rem" paddingTop="4rem">

          <MeetingPhaseHeading>
            Meeting Summary
          </MeetingPhaseHeading>

          <Type align="center" marginBottom="2rem" marginTop="2rem" scale="s5">
            <b>{makeSuccessExpression()}</b>! We worked on{' '}
            <span className={css(styles.highlight)}>{agendaItemsCompleted} Agenda Items</span><br />
            <span>resulting in </span>
            <span className={css(styles.highlight)}>{projectCount} New Projects </span>
            <span>and </span>
            <span className={css(styles.highlight)}>{actionCount} New Actions</span>
            <span>.</span>
          </Type>

          <Type align="center" marginBottom="1rem" marginTop="1rem" scale="s5">
            Read below for a meeting details or return
            to <Link to={`/team/${teamId}`}>{teamName}</Link>.
          </Type>

          {meetingNumber === 1 &&
            <MeetingSection paddingBottom="2rem" paddingTop="2rem">
              <SummaryFirstTime />
            </MeetingSection>
          }

          <MeetingSection paddingBottom="2rem" paddingTop="2rem">
            <SummaryQuickStats
              actionCount={actionCount}
              projectCount={projectCount}
            />
          </MeetingSection>

          <MeetingSection paddingBottom="2rem" paddingTop="2rem">
            <SummaryEmailPreview teamMembers={teamMembers} />
          </MeetingSection>

        </MeetingSection>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingSummary.propTypes = {
  styles: PropTypes.object,
};

const styleThunk = () => ({
  root: {
    width: '100%'
  },

  highlight: {
    color: appTheme.palette.warm,
    fontWeight: 700
  }
});

MeetingSummary.propTypes = {
  actionCount: PropTypes.number,
  agendaItemsCompleted: PropTypes.number,
  meetingNumber: PropTypes.number,
  projectCount: PropTypes.number,
  teamId: PropTypes.string,
  teamMembers: PropTypes.array,
  teamName: PropTypes.string,
  title: PropTypes.string
};

export default withStyles(styleThunk)(MeetingSummary);
