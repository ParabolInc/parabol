import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';

const Callout = (props) => {
  const textStyle = {
    backgroundColor: '#fff',
    border: '2px solid #D2D3DC',
    color: theme.palette.dark,
    fontFamily: ui.emailFontFamily,
    fontSize: `${props.fontSize}px`,
    fontWeight: props.fontWeight,
    lineHeight: `${props.lineHeight}`,
    padding: `${props.padding}px`,
  };

  return (
    <div>
      <EmptySpace height={props.vSpacing} />
      <table width={props.width}>
        <tbody>
          <tr>
            <td
              align="center"
              style={textStyle}
            >
              {props.children}
            </td>
          </tr>
        </tbody>
      </table>
      <EmptySpace height={props.vSpacing} />
    </div>
  );
};

Callout.propTypes = {
  children: PropTypes.any,
  fontSize: PropTypes.number,
  fontWeight: PropTypes.oneOf([
    400,
    700
  ]),
  lineHeight: PropTypes.number,
  padding: PropTypes.number,
  vSpacing: PropTypes.number,
  width: PropTypes.string
};

Callout.defaultProps = {
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1.5,
  padding: 32,
  vSpacing: 32,
  width: '80%'
};

export default Callout;
