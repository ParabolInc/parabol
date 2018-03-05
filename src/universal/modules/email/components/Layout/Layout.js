import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';

const Layout = (props) => {
  const containerStyle = {
    WebkitTextSizeAdjust: '100%',
    msTextSizeAdjust: '100%',
    msoTableLspace: '0pt',
    msoTableRspace: '0pt',
    backgroundColor: ui.emailBackgroundColor,
    borderCollapse: 'collapse',
    margin: '0px auto',
    textAlign: 'center'
  };

  const innerStyle = {
    WebkitTextSizeAdjust: '100%',
    msTextSizeAdjust: '100%',
    msoTableLspace: '0pt',
    msoTableRspace: '0pt',
    borderCollapse: 'collapse',
    fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif',
    margin: '0px auto',
    textAlign: 'center'
  };

  const cellStyle = {
    padding: '16px 0px',
    textAlign: 'center'
  };

  return (
    <table align="center" style={containerStyle} width="100%">
      <tbody>
        <tr>
          <td align="center" style={cellStyle}>
            <table align="center" style={innerStyle} width="600">
              <tbody>
                <tr>
                  <td style={cellStyle}>
                    {props.children}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

Layout.propTypes = {
  children: PropTypes.any
};

export default Layout;
