// @flow
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import EmptySpace from '../EmptySpace/EmptySpace';
import plural from 'universal/utils/plural';

const cellStyles = {
  padding: 0,
  textAlign: 'center',
  verticalAlign: 'top',
  width: '25%'
};

const fontStyles = {
  color: appTheme.palette.dark,
  fontFamily: ui.emailFontFamily
};

const statStyles = {
  backgroundColor: appTheme.palette.light,
  padding: '8px 0 12px',
  textAlign: 'center'
};

const statValue = {
  ...fontStyles,
  fontSize: '36px'
};

const statLabel = {
  ...fontStyles,
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase'
};

const containerStyle = {
  margin: '0 auto',
  maxWidth: '440px',
  width: '100%'
};

type Props = {
  meeting: Object
};

const RetroQuickStats = (props: Props) => {
  const {meeting} = props;
  const {meetingMembers, reflectionGroups} = meeting;
  const reflectionCount = reflectionGroups.reduce((sum, {reflections}) => sum + reflections.length, 0);
  const upvotedTopicCount = reflectionGroups.filter(({voteCount}) => voteCount > 0).length;
  const newTaskCount = meetingMembers.reduce((sum, {tasks}) => sum + tasks.length, 0);
  const meetingMembersCount = meetingMembers.length;
  const meetingMembersPresentCount = meetingMembers.filter((member) => member.isCheckedIn === true).length;
  return (
    <div style={containerStyle}>
      <table width="100%">
        <tbody>
          <tr>
            <td style={cellStyles}>
              <div style={{...statStyles, borderRadius: '4px 0 0 4px'}}>
                <div style={statValue}>{reflectionCount}</div>
                <div style={statLabel}>{plural(reflectionCount, 'Reflection')}</div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={statStyles}>
                <div style={statValue}>{upvotedTopicCount}</div>
                <div style={statLabel}>{plural(upvotedTopicCount, 'Upvoted Topic')}</div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={statStyles}>
                <div style={statValue}>{newTaskCount}</div>
                <div style={statLabel}>{plural(newTaskCount, 'New Task')}</div>
              </div>
            </td>
            <td style={cellStyles}>
              <div style={{...statStyles, borderRadius: '0 4px 4px 0'}}>
                <div style={statValue}>
                  {meetingMembersPresentCount >= 10 ?
                    <span>{meetingMembersPresentCount}</span> :
                    <span>{meetingMembersPresentCount}/{meetingMembersCount}</span>
                  }
                </div>
                <div style={statLabel}>Present</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <EmptySpace height={32} />
    </div>
  );
};

export default RetroQuickStats;
