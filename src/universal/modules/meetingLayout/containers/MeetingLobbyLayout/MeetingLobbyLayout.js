import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import CopyToClipboard from 'react-copy-to-clipboard';
import theme from 'universal/styles/theme';

import AvatarGroup from 'universal/components/AvatarGroup/AvatarGroup';
import Button from 'universal/components/Button/Button';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';

import Jordan from 'universal/styles/theme/images/avatars/jordan-husney-avatar.jpg';
import Matt from 'universal/styles/theme/images/avatars/matt-krick-avatar.jpg';
import Taya from 'universal/styles/theme/images/avatars/taya-mueller-avatar.jpg';
import Terry from 'universal/styles/theme/images/avatars/terry-acker-avatar.jpg';

// NOTE: This is a throw-away layout component for prototyping.
//       The real deal is being coded up in /meeting/components

let s = {};

const exampleTeam = {
  shortUrl: 'https://prbl.io/a/b7s8x9',
  teamName: 'Core',
  timerValue: '30:00',
  members: [
    {
      checkin: 'tbd',
      connection: 'online',
      hasBadge: true,
      image: Jordan,
      size: 'small'
    },
    {
      checkin: 'tbd',
      connection: 'online',
      hasBadge: true,
      image: Matt,
      size: 'small'
    },
    {
      checkin: 'tbd',
      connection: 'offline',
      hasBadge: true,
      image: Taya,
      size: 'small'
    },
    {
      checkin: 'tbd',
      connection: 'offline',
      hasBadge: true,
      image: Terry,
      size: 'small'
    }
  ]
};

const faStyle = {lineHeight: 'inherit'};
const faFontSize = `${14 * 2}px`; // FA based on 14px

const MeetingLobbyLayout = (props) => {
  const {shortUrl, teamName, members} = props;
  const handleClick = (e) => e.preventDefault();
  return (
    <MeetingLayout>
      {/* */}
      <Sidebar facilitatorLocation="lobby" location="lobby" shortUrl={shortUrl} teamName={teamName} members={members} />
      {/* */}
      <MeetingMain>
        {/* */}
        <MeetingSection paddingBottom="2rem" paddingTop="2rem">
          <AvatarGroup avatars={members} label="Team:" />
        </MeetingSection>
        {/* */}
        <MeetingSection flexToFill paddingBottom="2rem">
          {/* */}
          <div className={s.root}>
            <h1 className={s.heading}>Hi, {teamName} Team!</h1>
            <p className={s.label}>Tap to copy and share this meeting:</p>
            {/* */}
{/* TODO: prevent navigation and show a “Copied!” message inline or toast */}
            {/* */}
            <CopyToClipboard text={shortUrl}>
              <a
                className={s.link}
                href={shortUrl}
                onClick={(e) => handleClick(e)}
                title={`Copy link to meeting: ${shortUrl}`}
              >
                <span className={s.linkText}>{shortUrl}</span>
                <span className={s.icon}>
                  <FontAwesome name="copy" style={faStyle} />
                </span>
              </a>
            </CopyToClipboard>
            <h2 className={s.prompt}>Shall we begin with a Check-In round?</h2>
            <Button label="Start Meeting" size="large" style="outlined" theme="cool" />
          </div>
          {/* */}
        </MeetingSection>
        {/* */}
      </MeetingMain>
      {/* */}
    </MeetingLayout>
  );
};

s = StyleSheet.create({
  root: {
    textAlign: 'center'
  },

  heading: {
    color: theme.palette.warm,
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s7,
    fontWeight: 700,
    margin: 0
  },

  label: {
    color: theme.palette.dark,
    fontSize: theme.typography.s3,
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
      backgroundColor: theme.palette.cool10l
    },
    ':focus': {
      backgroundColor: theme.palette.cool10l
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
    color: theme.palette.dark,
    margin: '0 0 2rem'
  }
});

MeetingLobbyLayout.propTypes = {
  shortUrl: PropTypes.string,
  teamName: PropTypes.string,
  timerValue: PropTypes.string,
  members: PropTypes.array
};

MeetingLobbyLayout.defaultProps = exampleTeam;

export default look(MeetingLobbyLayout);
