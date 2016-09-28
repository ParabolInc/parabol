import React, {PropTypes} from 'react';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/Button/Button';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import Body from '../../components/Body/Body';
import Card from '../../components/Card/Card';
import Footer from '../../components/Footer/Footer';
import theme from 'universal/styles/theme';

const cardRowCell = {
  padding: '10px'
};

const colorCool = {
  color: theme.palette.cool
};

const colorWarm = {
  color: theme.palette.warm
};

const boldLinkStyle = {
  color: theme.palette.warm,
  fontWeight: 'bold',
  textDecoration: 'none'
};

const merryAndBold = {
  color: theme.palette.cool,
  fontFamily: '"Merriweather", "Georgia", serif',
  fontStyle: 'italic',
  fontWeight: 'bold'
};

const teamNameStyle = {
  ...merryAndBold,
  fontSize: '36px'
};

const textCenter = {
  textAlign: 'center'
};

const projectNameStyle = {
  ...merryAndBold,
  fontSize: '24px'
};

const iconStyle = {
  height: '14px',
  width: '13px'
};

const SummaryEmail = props => {
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

      <table width="100%">
        <tbody>
          <tr>
            <td
              align="center"
              style={{backgroundColor: theme.palette.warm}}
            >
              <EmptySpace height={16} />
            </td>
          </tr>
        </tbody>
      </table>

      <Body>
        <table align="center" width="100%">
          <tbody>
            <tr>
              <td style={textCenter}>
                <img src={inviterAvatar} height="64" width="64" />
                {inviterName}
              </td>
            </tr>
            <tr>
              <td style={textCenter}>
                <img src="/static/images/email/email-icon-project@3x.png" style={iconStyle} /> 3 New Projects<br />
                <img src="/static/images/email/email-icon-action@3x.png" style={iconStyle} /> 4 New Actions
              </td>
            </tr>
          </tbody>
        </table>

        <table align="center">
          <tr>
            <td style={cardRowCell}><Card content="Outcome description printed" status="active" team="Parabol" type="project" /></td>
            <td style={cardRowCell}><Card content="Outcome description printed" status="future" team="Parabol" type="project" /></td>
            <td style={cardRowCell}><Card content="Outcome description printed" team="Parabol" type="action" /></td>
          </tr>
        </table>

        <EmptySpace height={40} />
        <b>Hi <span style={colorWarm}>{inviteeEmail}</span>!<br />
        {inviterName} has invited you to join a team on Action:</b>
        <EmptySpace height={40} />
        <span style={teamNameStyle}>{teamName}</span>
        <EmptySpace height={40} />
        <a href="https://action-staging.parabol.co/" style={boldLinkStyle}>Action</a>
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
        <Button backgroundColor={theme.palette.warm} url={inviteLink}>
          Join Team
        </Button>
        <EmptySpace height={16} />
        Or go to: <a href={inviteLink} style={colorWarm}>{inviteLink}</a>
      </Body>
      <Footer color={theme.palette.dark} />
    </Layout>
  );
};

SummaryEmail.propTypes = {
  inviterAvatar: PropTypes.string.isRequired,
  inviterName: PropTypes.string.isRequired,
  inviterEmail: PropTypes.string.isRequired,
  inviteeEmail: PropTypes.string.isRequired,
  firstProject: PropTypes.string,
  teamName: PropTypes.string.isRequired,
  inviteLink: PropTypes.string.isRequired
};

export const summaryEmailText = (props) => `
Hello ${props.inviteeEmail},

${props.inviterName} has invited you to join the ${props.teamName} on Action.

Action is a place where your team will develop a weekly rhythm.

Get started here: ${props.inviteLink}

Your friends,
The Parabol Crew
`;

export default SummaryEmail;
