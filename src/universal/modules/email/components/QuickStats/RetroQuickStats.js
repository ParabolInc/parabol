// @flow
import React from 'react';
import EmptySpace from '../EmptySpace/EmptySpace';
import plural from 'universal/utils/plural';
import styles from './quickStatsStyles';
import {RETRO_TOPIC_LABEL, RETRO_VOTED_LABEL} from 'universal/utils/constants';

const {cellStyles, statStyles, statValue, statLabel, containerStyle} = styles;

type Props = {
  meeting: Object
};

const RetroQuickStats = (props: Props) => {
  const {meeting} = props;
  const {meetingMembers, reflectionGroups} = meeting;
  const reflectionCount = reflectionGroups.reduce(
    (sum, {reflections}) => sum + reflections.length,
    0
  );
  const upvotedTopicCount = reflectionGroups.filter(({voteCount}) => voteCount > 0).length;
  const newTaskCount = meetingMembers.reduce((sum, {tasks}) => sum + tasks.length, 0);
  const meetingMembersCount = meetingMembers.length;
  const meetingMembersPresentCount = meetingMembers.filter((member) => member.isCheckedIn === true)
    .length;
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
                <div style={statLabel}>
                  {plural(upvotedTopicCount, `${RETRO_VOTED_LABEL} ${RETRO_TOPIC_LABEL}`)}
                </div>
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
                  {meetingMembersPresentCount >= 10 ? (
                    <span>{meetingMembersPresentCount}</span>
                  ) : (
                    <span>
                      {meetingMembersPresentCount}/{meetingMembersCount}
                    </span>
                  )}
                </div>
                <div style={statLabel}>{'Present'}</div>
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
