import React from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import ui from 'universal/styles/ui';

const Header = (props) =>
  <table
    width="100%"
    height="120"
    color={props.color}
  >
    <tbody>
      <tr>
        <td>
          <EmptySpace height={50} />
          {/* Text area, could be another component, i.e. HeroText */}
          <table width="100%">
            <tbody>
              <tr>
                <td
                  align="center"
                  style={{color: props.color, fontFamily: ui.emailFontFamily}}
                >
                  Action by Parabol
                </td>
              </tr>
            </tbody>
          </table>
          <EmptySpace height={50} />
        </td>
      </tr>
    </tbody>
  </table>;

Header.propTypes = {
  color: React.PropTypes.string.isRequired
};

export default Header;
