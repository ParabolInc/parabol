import PropTypes from 'prop-types';
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';

const Header = (props) => {
  const tableStyle = {
    borderCollapse: 'collapse'
  };

  const imageStyle = {
    border: 0,
    display: 'block',
    margin: '0 auto'
  };

  const emailHeaderStyle = {
    backgroundColor: props.variant === 'dark' ? appTheme.palette.dark : appTheme.palette.mid10l,
    borderCollapse: 'collapse',
    color: '#FFFFFF',
    paddingBottom: '20px',
    paddingTop: '20px',
    textAlign: 'center'
  };

  const variantLogo = `email-header-branding${props.variant === 'light' ? '-light' : ''}`;

  return (
    <table style={tableStyle} width="100%">
      <tbody>
        <tr>
          <td align="center" style={emailHeaderStyle}>
            <img
              alt="Parabol, Inc. Logo"
              height={56}
              src={`/static/images/email/email-header-branding/${variantLogo}@2x.png`}
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
  variant: PropTypes.oneOf([
    'dark',
    'light'
  ])
};

Header.defaultProps = {
  variant: 'dark'
};

export default Header;
