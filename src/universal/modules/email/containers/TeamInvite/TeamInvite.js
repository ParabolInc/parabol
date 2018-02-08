import PropTypes from 'prop-types';
import React from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/Button/Button';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import Body from '../../components/Body/Body';
import Header from '../../components/Header/Header';
import Callout from '../../components/Callout/Callout';
import Footer from '../../components/Footer/Footer';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const colorCool = {
  color: appTheme.palette.cool
};

const colorWarm = {
  color: appTheme.palette.warm
};

const boldLinkStyle = {
  color: appTheme.palette.warm,
  fontWeight: 'bold',
  textDecoration: 'none'
};

const merryAndBold = {
  color: appTheme.palette.cool,
  fontFamily: '"Merriweather", "Georgia", serif',
  fontStyle: 'italic',
  fontWeight: 'bold'
};

const teamNameStyle = {
  ...merryAndBold,
  fontSize: '36px'
};

const ruleStyle = {
  backgroundColor: ui.emailRuleColor,
  border: 0,
  height: '2px',
  margin: '0 auto',
  width: '80%'
};

const calloutTextStyle = {
  color: appTheme.palette.dark
};

const secondaryMessage = {
  color: appTheme.palette.dark,
  fontSize: '20px',
  lineHeight: '30px'
};

const TeamInvite = (props) => {
  const {
    inviterAvatar,
    inviterName,
    inviterEmail,
    inviteeEmail,
    inviteeName,
    // firstTask,
    teamName,
    inviteLink
  } = props;
  const nameOrEmail = inviteeName || inviteeEmail;
  return (
    <Layout>

      <Header />

      <Body verticalGutter={32}>
        <table style={ui.emailTableBase} align="center">
          <tbody>
            <tr>
              <td width="64">
                <img src={inviterAvatar} height="64" width="64" />
              </td>
              <td style={{paddingLeft: '16px', textAlign: 'left'}}>
                {inviterName}<br />
                <a href={`mailto:${inviterEmail}`} style={{...colorCool, fontSize: '14px'}}>{inviterEmail}</a>
              </td>
            </tr>
          </tbody>
        </table>
        <table style={ui.emailTableBase} width="100%">
          <tbody>
            <tr>
              <td style={{paddingLeft: '16px', paddingRight: '16px'}}>
                <Callout fontSize={18} width="100%">
                  <b style={calloutTextStyle}>
                    Hi <a href={`mailto:${inviteeEmail}`} style={{...colorWarm, textDecoration: 'none'}}>{nameOrEmail}</a>!<br />
                    {inviterName} has invited you to join a team on Parabol:
                  </b>
                  <EmptySpace height={12} />
                  <span style={teamNameStyle}>{teamName}</span>
                </Callout>
              </td>
            </tr>
          </tbody>
        </table>
        <Button backgroundColor={appTheme.palette.warm} url={inviteLink}>
          Join Team
        </Button>
        <EmptySpace height={16} />
        Or go to: <a href={inviteLink} style={colorWarm}>{inviteLink}</a>
        <EmptySpace height={32} />
        <div style={ruleStyle} />
        <EmptySpace height={32} />
        <div className={secondaryMessage}>
          Parabol helps teams{' '}
          <a
            href="https://focus.parabol.co/how-to-navigate-uncertainty-fc0dfaaf3830"
            style={boldLinkStyle}
            title="How to Navigate Uncertainty using the Action Rhythm"
          >
            develop a weekly rhythm
          </a>.<br />
          <a href={inviteLink} style={boldLinkStyle}>Add a task to the board</a> to get started.
        </div>
        <EmptySpace height={32} />
      </Body>
      <Footer color={appTheme.palette.dark} />
    </Layout>
  );
};

// TODO: Don’t show this until we actually transfer it to the dashboard as a task? (TA)
// {firstTask &&
//   <div>
//     <b>{inviterName} added one of your tasks to Parabol</b>:
//     <EmptySpace height={32} />
//     <span style={taskNameStyle}>“{firstTask}”</span>
//     <EmptySpace height={32} />
//   </div>
// }

TeamInvite.propTypes = {
  inviterAvatar: PropTypes.string.isRequired,
  inviteeName: PropTypes.string,
  inviteeEmail: PropTypes.string.isRequired,
  inviterName: PropTypes.string.isRequired,
  inviterEmail: PropTypes.string.isRequired,
  firstTask: PropTypes.string,
  teamName: PropTypes.string.isRequired,
  inviteLink: PropTypes.string.isRequired
};

export const teamInviteText = (props) => `
Hello ${props.inviteeName || props.inviteeEmail},

${props.inviterName} has invited you to join the ${props.teamName} on Parabol.

Parabol is a place where your team will develop a weekly rhythm.

Get started here: ${props.inviteLink}

Your friends,
The Parabol Crew
`;

export default TeamInvite;
