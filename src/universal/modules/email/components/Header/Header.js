import React from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import ui from 'universal/styles/ui';

const Header = (props) => {
  const cellStyle = {
    color: props.color,
    fontFamily: ui.emailFontFamily,
    textAlign: 'center'
  };

  return (
    <table
      color={props.color}
      height="120"
      width="100%"
    >
      <tbody>
        <tr>
          <td>
            <EmptySpace height={50} />
            {/* Text area, could be another component, i.e. HeroText */}
            <table width="100%">
              <tbody>
                <tr>
                  <td style={cellStyle}>
                    Parabol
                  </td>
                </tr>
              </tbody>
            </table>
            <EmptySpace height={50} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

Header.propTypes = {
  color: React.PropTypes.string.isRequired
};

export default Header;
