import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import FontAwesome from 'react-fontawesome';
import CopyToClipboard from 'react-copy-to-clipboard';
import appTheme from 'universal/styles/theme/appTheme';
import {cashay} from 'cashay';
import voidClick from 'universal/utils/voidClick';
import makeMeetingUrl from 'universal/utils/makeMeetingUrl';
import Button from 'universal/components/Button/Button';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';

const faStyle = {lineHeight: 'inherit'};

const createStartMeetingHandler = (members) => {
  return () => {
    const self = members.find(member => member.isSelf);
    if (!self) {
      throw new Error('You are not a member! How can that be?');
    }
    const firstFacilitator = members.find(member => member.isFacilitator);
    const safeFirstFacilitator = firstFacilitator || self;
    const facilitatorId = self.isFacilitator ? self.id : safeFirstFacilitator.id;
    const options = {variables: {facilitatorId}};
    cashay.mutate('startMeeting', options);
  };
};

const MeetingLobby = (props) => {
  const {members, team, styles} = props;
  const {id: teamId, name: teamName} = team;

  const onStartMeetingClick = createStartMeetingHandler(members);
  const shortUrl = makeMeetingUrl(teamId);
  return (
    <MeetingMain>
      {/* */}
      <MeetingSection flexToFill paddingBottom="2rem">
        {/* */}
        <div className={css(styles.root)}>
          <MeetingPhaseHeading>Hi, {teamName} Team!</MeetingPhaseHeading>
          <p className={css(styles.label)}>{'Copy & share this meeting:'}</p>
          {/* */}
          {/* TODO: prevent navigation and show a “Copied!” message inline or toast */}
          {/* */}
          <CopyToClipboard text={shortUrl}>
            <a
              className={css(styles.link)}
              href={shortUrl}
              onClick={voidClick}
              title={`Copy link to meeting: ${shortUrl}`}
            >
              <span className={css(styles.linkText)}>{shortUrl}</span>
              <span className={css(styles.icon)}>
                <FontAwesome name="copy" style={faStyle}/>
              </span>
            </a>
          </CopyToClipboard>
          <h2 className={css(styles.prompt)}>Team Facilitator: begin the Check-In round!</h2>
          <Button
            label="Start Meeting"
            onClick={onStartMeetingClick}
            size="largest"
            style="outlined"
            colorPalette="cool"
          />
        </div>
        {/* */}
      </MeetingSection>
      {/* */}
    </MeetingMain>
  );
};

MeetingLobby.propTypes = {
  members: PropTypes.array,
  params: PropTypes.shape({
    teamId: PropTypes.string
  }),
  team: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  }),
  teamId: PropTypes.string,
  teamName: PropTypes.string,
};

const faFontSize = `${14 * 2}px`; // FA based on 14px
const styleThunk = () => ({
  root: {
    textAlign: 'center'
  },

  label: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    margin: '4rem 0 0',
    textTransform: 'uppercase'
  },

  link: {
    borderRadius: '.25rem',
    display: 'block',
    fontSize: faFontSize,
    margin: '.5rem 0 4rem',
    padding: '.75rem 1.5rem',
    textDecoration: 'none !important',

    ':hover': {
      backgroundColor: appTheme.palette.cool10l
    },
    ':focus': {
      backgroundColor: appTheme.palette.cool10l
    }
  },

  linkText: {
    display: 'inline-block',
    verticalAlign: 'middle'
  },

  icon: {
    display: 'inline-block',
    fontSize: faFontSize,
    marginLeft: '.5rem',
    verticalAlign: 'middle'
  },

  prompt: {
    color: appTheme.palette.dark,
    margin: '0 0 2rem'
  }
});

export default withStyles(styleThunk)(MeetingLobby);
