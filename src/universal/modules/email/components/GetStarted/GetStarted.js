import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';

const GetStarted = () => {
  const linkStyle = {
    color: appTheme.palette.cool,
    fontWeight: 700
  };

  const imageStyle = {
    border: 0,
    display: 'block',
    marginBottom: '8px'
  };

  const headingStyle = {
    color: appTheme.palette.warm,
    fontWeight: 700,
    textTransform: 'uppercase'
  };

  return (
    <div style={{textAlign: 'center'}}>
      <img
        height="48"
        src="/static/images/email/email-icon-star@2x.png"
        style={imageStyle}
        width="48"
      />
      <span style={headingStyle}>Getting Started</span><br />
      Read <a
        href="https://focus.parabol.co/how-to-navigate-uncertainty-fc0dfaaf3830"
        style={linkStyle}
        target="_blank"
        title="How to Navigate Uncertainty using the Action Rhythm"
      >How to Navigate Uncertainty</a>{' '}
      so you<br />
      can get into the swing of things.
    </div>
  );
};

export default GetStarted;
