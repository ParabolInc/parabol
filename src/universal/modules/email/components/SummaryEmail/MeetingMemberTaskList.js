// @flow
import React from 'react';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import plural from 'universal/utils/plural';
import {DONE} from 'universal/utils/constants';
import MeetingMemberTaskListItem from 'universal/modules/email/components/SummaryEmail/MeetingMemberTaskListItem';

const textCenter = {
  fontFamily: ui.emailFontFamily,
  textAlign: 'center'
};

const avatarStyles = {
  borderRadius: '100%'
};

const topBorderStyle = {
  ...textCenter,
  borderTop: `${ui.emailRuleHeight} solid ${ui.emailRuleColor}`
};

const nameStyle = {
  color: appTheme.palette.dark,
  display: 'block',
  fontSize: '20px',
  padding: '4px 0'
};

const presentLabelBase = {
  fontFamily: ui.emailFontFamily,
  fontSize: '14px',
  fontStyle: 'italic',
  fontWeight: 600,
  padding: '0 0 8px'
};

type Props = {|
  member: {
    isCheckedIn: boolean,
    tasks: Array<Object>,
    user: {
      picture: string,
      preferredName: string
    }
  }
|}
const MeetingMemberTaskList = (props: Props) => {
  const {member} = props;
  const {tasks, user: {picture, preferredName}, isCheckedIn} = member;
  const presentLabel = isCheckedIn ? 'Present' : 'Absent';
  const presentLabelStyles = {
    ...presentLabelBase,
    color: isCheckedIn ? appTheme.brand.secondary.green : appTheme.palette.mid50l
  };
  const doneTasks = tasks.filter((task) => task.status === DONE);
  const newTasks = tasks.filter((task) => task.status !== DONE);
  const doneTasksLabel = `${doneTasks.length} ${plural(doneTasks.length, 'Task')} Done`;
  const newTasksLabel = `${newTasks.length} New ${plural(newTasks.length, 'Task')}`;

  return (
    <table align="center" width="100%" style={ui.emailTableBase}>
      <tbody>
        <tr>
          <td style={topBorderStyle}>
            <EmptySpace height={24} />
            <img height="80" src={picture} style={avatarStyles} width="80" />
            <div style={nameStyle}>{preferredName}</div>
            <div style={presentLabelStyles}>{presentLabel}</div>
            <EmptySpace height={8} />
          </td>
        </tr>
        {/* Done Tasks */}
        <MeetingMemberTaskListItem tasks={doneTasks} label={doneTasksLabel} space={8} />
        {/* New Tasks */}
        <MeetingMemberTaskListItem tasks={newTasks} label={newTasksLabel} space={24} />
      </tbody>
    </table>
  );
};

export default MeetingMemberTaskList;
