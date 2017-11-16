import PropTypes from 'prop-types';
import React from 'react';

import makeAppLink from 'server/utils/makeAppLink';
import appTheme from 'universal/styles/theme/appTheme';

import Body from '../Body/Body';
import Button from '../Button/Button';
import Header from '../Header/Header';
import Layout from '../Layout/Layout';

export default function NotificationSummaryEmail() {
  const notificationPageUrl = makeAppLink('me/notifications');
  const linkStyle = {
    color: appTheme.palette.warm
  };
  const gutter = 48;
  return (
    <Layout>
      <Header imgProvider="hubspot" />
      <Body align="left" verticalGutter={gutter}>
        <div style={{padding: `0px ${gutter}px`}}>
          <p>{'Hi there, '}%recipient.name%{'!'}</p>
          <p>
            {'You have received '}
            <span style={{fontWeight: 'bold'}}>%recipient.numNotifications%{' new notification(s)'}</span>
            {' in the last day.'}
          </p>
          <br />
          <Button
            backgroundColor={appTheme.palette.warm}
            url={notificationPageUrl}
          >
            {'See My Notifications'}
          </Button>
          <br />
          <p>{'This is just a friendly, automated nudge!'}</p>
          <p>{'Your teammates need you!'}</p>
          <p>{'The product team @Parabol 🙉 🙈 🙊'}</p>
          <br />
          <p>
            <b>{'P.S. We want to hear from you:'}</b>
          </p>
          <p>
            {'Email us at '}<a style={linkStyle} href="mailto:love@parabol.co">{'love@parabol.co'}</a>
            {' with any feedback or questions you may have about our software.'}
          </p>
          <p>
            {'Or, schedule a video chat with our product team: '}<br />
            <a style={linkStyle} href="https://calendly.com/parabol/product/">{'https://calendly.com/parabol/product/'}</a>
          </p>
        </div>
      </Body>
    </Layout>
  );
}

NotificationSummaryEmail.propTypes = {
  date: PropTypes.instanceOf(Date)
};
