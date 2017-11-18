import PropTypes from 'prop-types';
import React from 'react';
import Layout from '../../components/Layout/Layout';
import Callout from '../../components/Callout/Callout';
import ContactUs from '../../components/ContactUs/ContactUs';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import Features from '../../components/Features/Features';
import GetStarted from '../../components/GetStarted/GetStarted';
import Body from '../../components/Body/Body';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const ruleStyle = {
  backgroundColor: ui.emailRuleColor,
  border: 0,
  height: '2px',
  margin: '0 auto',
  width: '80%'
};

const emailLink = {
  color: appTheme.palette.warm,
  textDecoration: 'none'
};

const WelcomeEmail = (props) => {
  const {email} = props;

  return (
    <Layout>

      <Header />

      <Body lineHeight={1.5}>
        <Callout vSpacing={0}>
          Hi <a href={`mailto:${email}`} style={emailLink}>{email}</a>,<br />
          We’re <i>so glad</i> you’re here!!
        </Callout>
        <EmptySpace height={48} />
        <b>Parabol</b> is a place where you can:
        <EmptySpace height={32} />
        <Features vSpacing={0} />
        <EmptySpace height={32} />
        <GetStarted />
        <EmptySpace height={32} />
        <hr style={ruleStyle} />
        <EmptySpace height={32} />
        <ContactUs fontSize={18} lineHeight={1.5} vSpacing={0} />
      </Body>
      <Footer color={appTheme.palette.dark} />
    </Layout>
  );
};

WelcomeEmail.propTypes = {
  email: PropTypes.string.isRequired
};

// TODO: add props, and make me dynamic!!
export const welcomeEmailText = (props) => `
Hello ${props.email},

Thank you for signing up for Parabol!

Greater team momentum is only a few clicks away. Can you feel it? It's
like a refreshing breeze through your hair.

Your pal,

--
The Parabol Crew
`;

export default WelcomeEmail;
