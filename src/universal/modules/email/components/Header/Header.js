import PropTypes from 'prop-types';
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';

const Header = (props) => {
  const {
    imgProvider,
    variant
  } = props;

  const tableStyle = {
    borderCollapse: 'collapse'
  };

  const imageStyle = {
    border: 0,
    display: 'block',
    margin: '0 auto'
  };

  const emailHeaderStyle = {
    backgroundColor: variant === 'dark' ? appTheme.palette.dark : appTheme.palette.mid10l,
    borderCollapse: 'collapse',
    color: '#FFFFFF',
    paddingBottom: '20px',
    paddingTop: '20px',
    textAlign: 'center'
  };

  const variantLogo = `email-header-branding${variant === 'light' ? '-light' : ''}`;
  const provider = imgProvider === 'hubspot' ?
    'https://email.parabol.co/hubfs/app-emails/' :
    '/static/images/email/email-header-branding/';
  const imageSrc = `${provider}${variantLogo}@2x.png`;

  return (
    <table style={tableStyle} width="100%">
      <tbody>
        <tr>
          <td align="center" style={emailHeaderStyle}>
            <img
              alt="Parabol, Inc. Logo"
              height={56}
              src={imageSrc}
              style={imageStyle}
              width={262}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

Header.propTypes = {
  imgProvider: PropTypes.oneOf([
    'app',
    'hubspot'
  ]),
  variant: PropTypes.oneOf([
    'dark',
    'light'
  ])
};

Header.defaultProps = {
  imgProvider: 'app',
  variant: 'dark'
};

export default Header;
