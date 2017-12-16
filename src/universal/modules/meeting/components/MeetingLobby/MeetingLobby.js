import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import StartMeetingMutation from 'universal/mutations/StartMeetingMutation';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import makeHref from 'universal/utils/makeHref';
import withMutationProps from 'universal/utils/relay/withMutationProps';

const MeetingLobby = (props) => {
  const {atmosphere, history, onError, onCompleted, submitMutation, submitting, team, styles} = props;
  const {teamId, teamName} = team;
  const onStartMeetingClick = () => {
    submitMutation();
    StartMeetingMutation(atmosphere, teamId, history, onError, onCompleted);
  };
  const meetingUrl = makeHref(`/meeting/${teamId}`);
  return (
    <MeetingMain>
      {/* */}
      <div className={css(styles.root)}>
        <MeetingPhaseHeading>{`Hi, ${teamName} Team!`}</MeetingPhaseHeading>
        <div className={css(styles.helpText)}>
          {'Is the whole team here?'}
        </div>
        <div className={css(styles.prompt)}>
          {'The person who presses “Start Meeting” will facilitate the meeting.'}<br />
          {'Everyone’s display automatically follows the Facilitator.'}
        </div>
        <div className={css(styles.helpText)}>
          <b>{'Today’s Facilitator'}</b>{`: begin the ${actionMeeting.checkin.name}!`}
        </div>
        <div className={css(styles.buttonBlock)}>
          <Button
            buttonStyle="solid"
            colorPalette="cool"
            depth={1}
            isBlock
            label="Start Meeting"
            onClick={onStartMeetingClick}
            buttonSize="large"
            textTransform="uppercase"
            waiting={submitting}
          />
        </div>
        <p className={css(styles.label)}>{'Meeting Link:'}</p>
        <div className={css(styles.urlBlock)}>
          <CopyShortLink url={meetingUrl} />
        </div>
      </div>
      {/* */}
    </MeetingMain>
  );
};

MeetingLobby.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  styles: PropTypes.object,
  team: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  }),
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

const styleThunk = () => ({
  root: {
    paddingTop: '2rem',
    textAlign: 'center',

    [ui.breakpoint.wide]: {
      paddingTop: '3rem'
    },
    [ui.breakpoint.wider]: {
      paddingTop: '4rem'
    },
    [ui.breakpoint.widest]: {
      paddingTop: '6rem'
    }
  },

  helpText: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s5,
    fontWeight: 400,
    lineHeight: 1.5,
    margin: '1.75rem 0 0'
  },

  prompt: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s5,
    fontWeight: 700,
    margin: '2rem 0'
  },

  buttonBlock: {
    margin: '0 auto',
    paddingTop: '2.25rem',
    width: '13rem'
  },

  label: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    margin: '4rem 0 0',
    textTransform: 'uppercase'
  },

  urlBlock: {
    margin: '.5rem 0 0',
    verticalAlign: 'middle'
  }
});

export default createFragmentContainer(
  withRouter(withAtmosphere(withMutationProps(withStyles(styleThunk)(MeetingLobby)))),
  graphql`
    fragment MeetingLobby_team on Team {
      teamId: id
      teamName: name
    }
  `
);
