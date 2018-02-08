import PropTypes from 'prop-types';
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import EmptySpace from '../../components/EmptySpace/EmptySpace';

const UserNoNewOutcomes = (props) => {
  const {members} = props;
  const cardsCell = {
    padding: '8px'
  };

  const textCenter = {
    fontFamily: ui.emailFontFamily,
    textAlign: 'center'
  };

  const avatarSize = members.length === 1 ? 80 : 64;

  const avatarStyles = {
    borderRadius: '100%'
  };

  const topBorderStyle = {
    ...textCenter,
    borderTop: `1px solid ${ui.cardBorderColor}`
  };

  const nameStyle = {
    color: appTheme.palette.dark,
    display: 'block',
    fontSize: members.length === 1 ? '20px' : '14px',
    padding: '4px 0'
  };

  const emptyOutcomesMessage = {
    ...textCenter,
    backgroundColor: '#ffffff',
    border: `1px solid ${ui.cardBorderColor}`,
    borderRadius: '4px',
    fontFamily: ui.emailFontFamily,
    fontSize: '16px',
    fontStyle: 'italic',
    padding: '16px'
  };

  const attendingStyles = {
    fontFamily: ui.emailFontFamily,
    fontSize: members.length === 1 ? '14px' : '13px',
    fontStyle: 'italic',
    fontWeight: 700,
    padding: '0 0 8px'
  };

  const presentStyles = {
    ...attendingStyles,
    color: appTheme.palette.cool
  };

  const absentStyles = {
    ...attendingStyles,
    color: appTheme.palette.cool10g
  };

  const getMemberRows = (arr) => {
    const rows = [];
    const length = arr.length;
    // Never 1 person on a row alone, make rows of 3 or 4
    // Never 2 people after a row of 4, make rows of 3
    const modulo = length % 4;
    let rowLength = 4;
    if (modulo === 1 || modulo === 2) {
      rowLength = 3;
    }
    for (let i = 0; i < length; i += rowLength) {
      const subArr = arr.slice(i, i + rowLength);
      rows.push(subArr);
    }
    return rows;
  };

  const memberCells = getMemberRows(members);

  const cellStyle = {
    padding: members.length === 1 ? '0px' : '8px 0 0',
    textAlign: 'center',
    verticalAlign: 'top'
  };

  const cellWidth = members.length === 1 ? 320 : 132;

  const makeMemberCells = (arr) => {
    const cells = () =>
      arr.map((member) =>
        (<td align="center" style={cellStyle} width={cellWidth} key={member.id}>
          <img height={avatarSize} src={member.picture} style={avatarStyles} width={avatarSize} />
          <div style={nameStyle}>{member.preferredName}</div>
          {member.present ?
            <div style={presentStyles}>Present</div> :
            <div style={absentStyles}>Absent</div>
          }
        </td>)
      );
    return cells();
  };

  /* eslint-disable react/no-array-index-key */
  return (
    <table align="center" style={ui.emailTableBase} width="100%">
      <tbody>
        <tr>
          <td style={topBorderStyle}>
            <EmptySpace height={24} />
          </td>
        </tr>
        {members.length &&
          <tr>
            <td align="center">
              <table align="center" style={ui.emailTableBase}>
                <tbody>
                  {memberCells.map((row, idx) =>
                    (<tr key={`memberCell${idx}`}>
                      {makeMemberCells(row)}
                    </tr>)
                  )}
                </tbody>
              </table>
            </td>
          </tr>
        }
        <tr>
          <td style={cardsCell}>
            <div style={{padding: '0 8px'}}>
              <div style={emptyOutcomesMessage}>
                {'No new Tasks this week…'}
              </div>
            </div>
            <EmptySpace height={24} />
          </td>
        </tr>
      </tbody>
    </table>
  );
  /* eslint-enable */
};

UserNoNewOutcomes.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape({
    present: PropTypes.bool.isRequired,
    picture: PropTypes.string.isRequired,
    preferredName: PropTypes.string.isRequired
  }))
};

export default UserNoNewOutcomes;
