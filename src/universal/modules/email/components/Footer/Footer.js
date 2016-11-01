import React from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const Footer = (props) => {
  const tableStyle = {
    ...ui.emailTableBase,
    backgroundColor: ui.emailBackgroundColor,
    color: props.color
  };

  const spaceStyle = {
    lineHeight: '1px',
    fontSize: '1px'
  };

  const cellStyles = {
    backgroundColor: '#F9FAFB',
    color: props.color,
    fontFamily: ui.emailFontFamily,
    textAlign: 'center'
  };

  return (
    <table
      width="100%"
      style={tableStyle}
    >
      <tbody>

        <tr>
          <td><EmptySpace height={20} /></td>
          <td><EmptySpace height={20} /></td>
          <td><EmptySpace height={20} /></td>
        </tr>

        <tr>
          <td
            height="1"
            width="20"
            style={spaceStyle}
          >
            &nbsp;
          </td>

          <td>
            <table width="560">
              <tbody>
                <tr>
                  <td style={cellStyles}>
                    <EmptySpace height={10} />
                    <img src="/static/images/brand/mark-color@3x.png" height="28" width="31" />
                    <EmptySpace height={10} />
                    Crafted with care by the folks at <a
                      style={{color: appTheme.palette.warm, textDecoration: 'none'}}
                      href="http://www.parabol.co/"
                    > Parabol</a>.
                    <EmptySpace height={10} />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>

          <td
            height="1"
            width="20"
            style={spaceStyle}
          >
            &nbsp;
          </td>
        </tr>

        <tr>
          <td><EmptySpace height={32} /></td>
          <td><EmptySpace height={32} /></td>
          <td><EmptySpace height={32} /></td>
        </tr>
      </tbody>
    </table>
  );
};

Footer.propTypes = {
  color: React.PropTypes.string.isRequired
};

export default Footer;
