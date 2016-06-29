import React, {Component} from 'react';
import Layout from '../../components/Layout/Layout';
import Header from '../../components/Header/Header';
import Button from '../../components/Button/Button';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import Body from '../../components/Body/Body';
import Footer from '../../components/Footer/Footer';
import theme from 'universal/styles/theme';

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

const projectNameStyle = {
  ...merryAndBold,
  fontSize: '24px'
};

// eslint-disable-next-line react/prefer-stateless-function
export default class TeamInvite extends Component {
  render() {
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
          <table align="center">
            <tbody>
              <tr>
                <td width="64">
                  <img src="/static/images/avatars/jh-linkedin-avatar.jpg" height="64" width="64" />
                </td>
                <td style={{paddingLeft: '16px'}}>
                  Jordan Husney<br />
                  <span style={colorCool}>jordan@parabol.co</span>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <EmptySpace height={40} />
          <b>Hi <span style={colorWarm}>terry@parabol.co</span>!<br />
          Jordan has invited you to join a team on Action:</b>
          <EmptySpace height={40} />
          <span style={teamNameStyle}>Engineering</span>
          <EmptySpace height={40} />
          <a href="https://action-staging.parabol.co/" style={boldLinkStyle}>Action</a>
          &nbsp;is a place where you and your team <br />will develop your <b><i>weekly rhythm</i></b>.<br />
          <EmptySpace height={40} />
          <b>Jordan added one of your projects to Action</b>:
          <EmptySpace height={32} />
          <span style={projectNameStyle}>“Onboarding flow shipped”</span>
          <EmptySpace height={32} />
          <Button backgroundColor={theme.palette.warm}>
            Join Team
          </Button>
          <EmptySpace height={16} />
          Or go to: <a href="https://prbl.io/a/b7s8x9" style={colorWarm}>https://prbl.io/a/b7s8x9</a>
        </Body>
        <Footer color={theme.palette.dark} />
      </Layout>
    );
  }
}
