// @flow
import * as React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const avatarStyles = {
  borderRadius: '100%'
};

type MeetingMember = {
  id: string,
  isCheckedIn: ?boolean,
  user: {
    picture: string,
    preferredName: string
  }
};

type Props = {
  members: Array<MeetingMember>
};

const MeetingMemberNoTasksRow = (props: Props) => {
  const {members} = props;
  const avatarSize = members.length === 1 ? 80 : 64;

  const nameStyle = {
    color: appTheme.palette.dark,
    display: 'block',
    fontSize: members.length === 1 ? '20px' : '14px',
    padding: '4px 0'
  };

  const attendingStyles = {
    fontFamily: ui.emailFontFamily,
    fontSize: members.length === 1 ? '14px' : '13px',
    fontStyle: 'italic',
    fontWeight: 600,
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

  const cellStyle = {
    padding: members.length === 1 ? '0px' : '8px 0 0',
    textAlign: 'center',
    verticalAlign: 'top'
  };

  const cellWidth = members.length === 1 ? 320 : 132;
  return members.map((member) => (
    <td align="center" style={cellStyle} width={cellWidth} key={member.id}>
      <img height={avatarSize} src={member.user.picture} style={avatarStyles} width={avatarSize} />
      <div style={nameStyle}>{member.user.preferredName}</div>
      {member.isCheckedIn ? (
        <div style={presentStyles}>Present</div>
      ) : (
        <div style={absentStyles}>Absent</div>
      )}
    </td>
  ));
};

export default MeetingMemberNoTasksRow;
