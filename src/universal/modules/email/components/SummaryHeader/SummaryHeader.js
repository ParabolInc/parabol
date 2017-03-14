import React, {PropTypes} from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import makeDateString from 'universal/utils/makeDateString';
import {Link} from 'react-router';

const SummaryHeader = (props) => {
  const {createdAt, referrer, teamDashUrl, teamName} = props;
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
    textAlign: 'center'
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
    backgroundColor: appTheme.palette.cool,
    borderRadius: '4px',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'block',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '16px auto 0',
    padding: '6px 0',
    textAlign: 'center',
    textDecoration: 'none',
    width: '186px'
  };

  const teamNameStyle = {
    ...textStyle,
    fontSize: '36px'
  };
  const meetingDate = makeDateString(createdAt);
  return (
    <div style={{padding: '0 16px'}}>
      <EmptySpace height={props.vSpacing} />
      <table width={props.width}>
        <tbody>
          <tr>
            <td style={blockStyle}>
              <div style={teamNameStyle}>{teamName}</div>
              <div style={meetingDateStyle}>Meeting Summary • {meetingDate}</div>
              {referrer === 'email' ?
                <a
                  href={teamDashUrl}
                  style={teamDashLinkStyle}
                  title="Go to Team Dashboard"
                >Go to Team Dashboard
                </a> :
                <Link to={teamDashUrl} style={teamDashLinkStyle} title="Go to Team Dashboard">
                  Go to Team Dashboard
                </Link>
              }
            </td>
          </tr>
        </tbody>
      </table>
      <EmptySpace height={props.vSpacing} />
    </div>
  );
};

SummaryHeader.propTypes = {
  children: PropTypes.any,
  createdAt: PropTypes.instanceOf(Date).isRequired,
  fontSize: PropTypes.number,
  fontWeight: PropTypes.oneOf([
    400,
    700
  ]),
  lineHeight: PropTypes.number,
  padding: PropTypes.number,
  referrer: PropTypes.oneOf([
    'meeting',
    'email',
    'history'
  ]).isRequired,
  teamDashUrl: PropTypes.string.isRequired,
  teamName: PropTypes.string,
  vSpacing: PropTypes.number,
  width: PropTypes.string
};

SummaryHeader.defaultProps = {
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1.5,
  padding: 24,
  vSpacing: 32,
  width: '100%'
};

export default SummaryHeader;
