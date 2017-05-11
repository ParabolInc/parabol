import React from 'react';
import Oy from 'oy-vey';
import WelcomeEmail, {welcomeEmailText} from './WelcomeEmail';

const subject = 'Welcome to Parabol';

export default (props) => ({
  subject,
  body: welcomeEmailText(props),
  html: Oy.renderTemplate(<WelcomeEmail {...props} />, {
    title: subject,
    previewText: subject
  })
});
