import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import CopyToClipboard from 'react-copy-to-clipboard';
import theme from 'universal/styles/theme';
import {LOBBY} from 'universal/utils/constants';

import AvatarGroup from '../../../meeting/components/AvatarGroup/AvatarGroup';
import Button from 'universal/components/Button/Button';
import MeetingLayout from 'universal/modules/meeting/components/MeetingLayout/MeetingLayout';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingPhaseHeading from 'universal/modules/meeting/components/MeetingPhaseHeading/MeetingPhaseHeading';
import Sidebar from 'universal/modules/team/components/Sidebar/Sidebar';

import exampleTeam from 'universal/modules/patterns/helpers/exampleTeam';

// NOTE: This is a throw-away layout component for prototyping.
//       The real deal is being coded up in /meeting/components

let s = {};

const faStyle = {lineHeight: 'inherit'};
const faFontSize = `${14 * 2}px`; // FA based on 14px

const MeetingLobbyLayout = (props) => {
  const {team} = props;
  const handleClick = (e) => e.preventDefault();
  return (
    <MeetingLayout>
      {/* */}
      <Sidebar facilitatorPhase={LOBBY} localPhase={LOBBY} {...team} />
      {/* */}
      <MeetingMain>
        {/* */}
        <MeetingSection paddingBottom="2rem" paddingTop="2rem">
          <AvatarGroup avatars={team.teamMembers} />
        </MeetingSection>
        {/* */}
        <MeetingSection flexToFill paddingBottom="2rem">
          {/* */}
          <div className={s.root}>
            <MeetingPhaseHeading>Hi, {team.teamName} Team!</MeetingPhaseHeading>
            <p className={s.label}>{'Copy & share this meeting:'}</p>
            {/* */}
{/* TODO: prevent navigation and show a “Copied!” message inline or toast */}
            {/* */}
            <CopyToClipboard text={team.shortUrl}>
              <a
                className={s.link}
                href={team.shortUrl}
                onClick={(e) => handleClick(e)}
                title={`Copy link to meeting: ${team.shortUrl}`}
              >
                <span className={s.linkText}>{team.shortUrl}</span>
                <span className={s.icon}>
                  <FontAwesome name="copy" style={faStyle} />
                </span>
              </a>
            </CopyToClipboard>
            <h2 className={s.prompt}>Team Facilitator: begin the Check-In round!</h2>
            <Button label="Start Meeting" size="largest" style="outlined" theme="cool" />
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
  team: PropTypes.object
};

MeetingLobbyLayout.defaultProps = {
  team: exampleTeam
};

export default look(MeetingLobbyLayout);
