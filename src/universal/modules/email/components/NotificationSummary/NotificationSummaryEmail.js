import PropTypes from 'prop-types';
import React from 'react';

import makeAppLink from 'server/utils/makeAppLink';
import appTheme from 'universal/styles/theme/appTheme';

import Body from '../Body/Body';
import Button from '../Button/Button';
import Callout from '../Callout/Callout';
import ContactUs from '../ContactUs/ContactUs';
import Header from '../Header/Header';
import Layout from '../Layout/Layout';

export default function NotificationSummaryEmail() {
  const notificationPageUrl = makeAppLink('me/notifications');
  return (
    <Layout>
      <Header color={appTheme.palette.dark} />
      <Body>
        <p>Hi there, %recipient.name%!</p>
        <p>You have received %recipient.numNotifications% new notification(s) in the last day.</p>
        <Callout>
          <Button url={notificationPageUrl}>See My Notifications</Button>
        </Callout>
      </Body>
      <p>This is just a friendly, nudge! Your teammates need you!</p>
      <p>- The product team @Parabol 🙉 🙈 🙊</p>
      <ContactUs
        prompt="P.S. Help us make our software better"
        tagline={
          'Tell us the good, the bad, and the Ugly! ' +
          'Or better yet, pick a time on our calendar for a video chat with our core product team: https://calendly.com/parabol/'
        }
      />
    </Layout>
  );
}

NotificationSummaryEmail.propTypes = {
  date: PropTypes.instanceOf(Date)
};
