import React from 'react';
import Oy from 'oy-vey';
import TeamInvite from 'universal/modules/email/containers/TeamInvite/TeamInvite';
// import WelcomeEmail from 'universal/modules/email/containers/WelcomeEmail/WelcomeEmail';

const demoInviteProps = {
  inviterAvatar: '/static/images/avatars/jh-linkedin-avatar.jpg',
  inviterName: 'Jordan Husney',
  inviterFirstName: 'Jordan',
  inviterEmail: 'jordan@parabol.co',
  inviteeEmail: 'terry@parabol.co',
  firstProject: 'Onboarding flow designed',
  teamName: 'Engineering',
  teamLink: 'https://prbl.io/a/b7s8x9'
};

export default function emailSSR(req, res) {
  const html = Oy.renderTemplate(<TeamInvite {...demoInviteProps} />, {
    title: 'Welcome to Action by Parabol',
    previewText: 'Welcome to Action by Parabol'
  });

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.send(html);
}
