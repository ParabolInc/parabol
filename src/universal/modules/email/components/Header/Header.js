import PropTypes from 'prop-types';
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';

const Header = (props) => {
  const {imgProvider} = props;

  const tableStyle = {
    borderCollapse: 'collapse'
  };

  const imageStyle = {
    border: 0,
    display: 'block',
    margin: '0 auto'
  };

  const emailHeaderStyle = {
    backgroundColor: appTheme.palette.mid,
    borderCollapse: 'collapse',
    color: '#FFFFFF',
    paddingBottom: '20px',
    paddingTop: '20px',
    textAlign: 'center'
  };

  const variantLogo = 'email-header-branding-white';
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
              width={209}
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
  ])
};

Header.defaultProps = {
  imgProvider: 'app'
};

export default Header;
