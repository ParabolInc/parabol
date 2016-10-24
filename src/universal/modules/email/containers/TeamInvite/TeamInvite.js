import React, {PropTypes} from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/Button/Button';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import Body from '../../components/Body/Body';
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

const projectNameStyle = {
  ...merryAndBold,
  fontSize: '24px'
};

const TeamInvite = props => {
  const {
    inviterAvatar,
    inviterName,
    inviterEmail,
    inviteeEmail,
    firstProject,
    teamName,
    inviteLink
  } = props;

  return (
    <Layout>

      <table style={ui.emailTableBase} width="100%">
        <tbody>
          <tr>
            <td style={{backgroundColor: appTheme.palette.warm}}>
              <EmptySpace height={16} />
            </td>
          </tr>
        </tbody>
      </table>

      <Body>
        <table style={ui.emailTableBase} align="center">
          <tbody>
            <tr>
              <td width="64">
                <img src={inviterAvatar} height="64" width="64" />
              </td>
              <td style={{paddingLeft: '16px'}}>
                {inviterName}<br />
                <a href={`mailto:${inviterEmail}`} style={{...colorCool, fontSize: '14px'}}>{inviterEmail}</a>
              </td>
            </tr>
          </tbody>
        </table>
        <EmptySpace height={40} />
        <b>Hi <a href={`mailto:${inviteeEmail}`} style={{...colorWarm, textDecoration: 'none'}}>{inviteeEmail}</a>!<br />
        {inviterName} has invited you to join a team on Action:</b>
        <EmptySpace height={40} />
        <span style={teamNameStyle}>{teamName}</span>
        <EmptySpace height={40} />
        <a href="https://action.parabol.co/" style={boldLinkStyle}>Action</a>
        &nbsp;is a place where you and your team <br />will develop your <b><i>weekly rhythm</i></b>.<br />
        <EmptySpace height={40} />
        {firstProject &&
          <div>
            <b>{inviterName} added one of your projects to Action</b>:
            <EmptySpace height={32} />
            <span style={projectNameStyle}>“{firstProject}”</span>
            <EmptySpace height={32} />
          </div>
        }
        <Button backgroundColor={appTheme.palette.warm} url={inviteLink}>
          Join Team
        </Button>
        <EmptySpace height={16} />
        Or go to: <a href={inviteLink} style={colorWarm}>{inviteLink}</a>
      </Body>
      <Footer color={appTheme.palette.dark} />
    </Layout>
  );
};

TeamInvite.propTypes = {
  inviterAvatar: PropTypes.string.isRequired,
  inviterName: PropTypes.string.isRequired,
  inviterEmail: PropTypes.string.isRequired,
  inviteeEmail: PropTypes.string.isRequired,
  firstProject: PropTypes.string,
  teamName: PropTypes.string.isRequired,
  inviteLink: PropTypes.string.isRequired
};

export const teamInviteText = (props) => `
Hello ${props.inviteeEmail},

${props.inviterName} has invited you to join the ${props.teamName} on Action.

Action is a place where your team will develop a weekly rhythm.

Get started here: ${props.inviteLink}

Your friends,
The Parabol Crew
`;

export default TeamInvite;
