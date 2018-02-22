import PropTypes from 'prop-types';
import React from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import makeDateString from 'universal/utils/makeDateString';
import {MEETING_NAME} from 'universal/utils/constants';

const SummaryHeader = (props) => {
  const {createdAt, meetingNumber, teamName} = props;
  const blockStyle = {
    backgroundColor: '#fff',
    color: appTheme.palette.dark,
    fontFamily: ui.emailFontFamily,
    fontSize: `${props.fontSize}px`,
    lineHeight: `${props.lineHeight}`,
    padding: `${props.padding}px`,
    textAlign: 'center'
  };

  const textStyle = {
    fontFamily: ui.emailFontFamily
  };

  const meetingDateStyle = {
    ...textStyle,
    fontSize: '18px',
    fontWeight: 400
  };

  const teamNameStyle = {
    ...textStyle,
    fontSize: '36px',
    fontWeight: 700
  };
  const meetingDate = makeDateString(createdAt, {showDay: true});

  const labelStyles = {
    color: appTheme.palette.dark70l,
    fontSize: '13px',
    fontWeight: 700,
    padding: '0 0 16px',
    textAlign: 'center',
    textTransform: 'uppercase'
  };

  return (
    <div style={{padding: '0 16px'}}>
      <EmptySpace height={props.vSpacing} />
      <table width={props.width}>
        <tbody>
          <tr>
            <td style={blockStyle}>
              <div style={labelStyles}>{'Meeting Summary'}</div>
              <div style={teamNameStyle}>{teamName}</div>
              <div style={meetingDateStyle}>{`${MEETING_NAME} #${meetingNumber}`}{' • '}{meetingDate}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

SummaryHeader.propTypes = {
  children: PropTypes.any,
  createdAt: PropTypes.oneOfType([
    PropTypes.string,
    // this comes from SSR
    PropTypes.instanceOf(Date)
  ]),
  fontSize: PropTypes.number,
  lineHeight: PropTypes.number,
  meetingNumber: PropTypes.number,
  padding: PropTypes.number,
  teamName: PropTypes.string,
  vSpacing: PropTypes.number,
  width: PropTypes.string
};

SummaryHeader.defaultProps = {
  fontSize: 24,
  lineHeight: 1.5,
  padding: 24,
  vSpacing: 16,
  width: '100%'
};

export default SummaryHeader;
