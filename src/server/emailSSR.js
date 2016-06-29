import React from 'react';
import Oy from 'oy-vey';
// import TeamInvite from 'universal/modules/email/containers/TeamInvite/TeamInvite';
import WelcomeEmail from 'universal/modules/email/containers/WelcomeEmail/WelcomeEmail';

export default function emailSSR(req, res) {
  const html = Oy.renderTemplate(<WelcomeEmail />, {
    title: 'Welcome to Action by Parabol',
    previewText: 'Welcome to Action by Parabol'
  });

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.send(html);
}
