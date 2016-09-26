import React from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';

const Footer = (props) => {
  const style = {
    backgroundColor: ui.emailBackgroundColor,
    color: props.color
  };

  const spaceStyle = {
    lineHeight: '1px',
    fontSize: '1px'
  };

  return (
    <table
      width="100%"
      style={style}
    >
      <tbody>

        <tr>
          <td><EmptySpace height="20" /></td>
          <td><EmptySpace height="20" /></td>
          <td><EmptySpace height="20" /></td>
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
                  <td
                    align="center"
                    bgColor="#F9FAFB"
                    style={{color: props.color, fontFamily: '"Karla", "Helvetica Neue", serif'}}
                  >

                    <EmptySpace height="10" />
                    <img src="/static/images/brand/mark-color@3x.png" height="28" width="31" />
                    <EmptySpace height="10" />

                    Crafted with care by the folks at <a
                      style={{color: theme.palette.warm, textDecoration: 'none'}}
                      href="http://www.parabol.co/"
                    > Parabol</a>.

                    <EmptySpace height="10" />
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
          <td><EmptySpace height="48" /></td>
          <td><EmptySpace height="48" /></td>
          <td><EmptySpace height="48" /></td>
        </tr>
      </tbody>
    </table>
  );
};

Footer.propTypes = {
  color: React.PropTypes.string.isRequired
};

export default Footer;
