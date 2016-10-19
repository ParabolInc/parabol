import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const Callout = (props) => {
  const {meetingDate, teamName, teamDashLink} = props;

  const blockStyle = {
    backgroundColor: '#fff',
    border: '2px solid #D2D3DC',
    borderRadius: '8px',
    color: appTheme.palette.dark,
    fontFamily: ui.emailFontFamily,
    fontSize: `${props.fontSize}px`,
    fontWeight: props.fontWeight,
    lineHeight: `${props.lineHeight}`,
    padding: `${props.padding}px`,
  };

  const textStyle = {
    fontFamily: ui.emailFontFamily,
    fontWeight: props.fontWeight
  };

  const meetingDateStyle = {
    ...textStyle,
    fontSize: '18px'
  };

  const teamDashLinkStyle = {
    ...textStyle,
    color: appTheme.palette.cool,
    fontSize: '14px'
  };

  const teamNameStyle = {
    ...textStyle,
    fontSize: '36px'
  };

  return (
    <div>
      <EmptySpace height={props.vSpacing} />
      <table width={props.width}>
        <tbody>
          <tr>
            <td
              align="center"
              style={blockStyle}
            >
              <div style={teamNameStyle}>{teamName}</div>
              <div style={meetingDateStyle}>Meeting Summary • {meetingDate}</div>
              <a href={teamDashLink} style={teamDashLinkStyle} title="Go to Team Dashboard">Go to Team Dashboard</a>
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
  meetingDate: PropTypes.string,
  padding: PropTypes.number,
  teamDashLink: PropTypes.string,
  teamName: PropTypes.string,
  vSpacing: PropTypes.number,
  width: PropTypes.string
};

Callout.defaultProps = {
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1.5,
  padding: 24,
  vSpacing: 32,
  width: '80%'
};

export default Callout;
