import PropTypes from 'prop-types';
import React from 'react';
import EmptySpace from '../../components/EmptySpace/EmptySpace';
import TasksTable from '../TasksTable/TasksTable';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import plural from 'universal/utils/plural';
import {DONE} from 'universal/utils/constants';

const UserTasks = (props) => {
  const {member} = props;
  const {tasks, picture, preferredName, present} = member;
  const cardsCell = {
    padding: '8px',
    textAlign: 'center'
  };

  const textCenter = {
    fontFamily: ui.emailFontFamily,
    textAlign: 'center'
  };

  const avatarStyles = {
    borderRadius: '100%'
  };

  const labelStyle = {
    display: 'inline-block',
    fontFamily: ui.emailFontFamily,
    fontSize: '14px',
    fontWeight: 600,
    verticalAlign: 'middle'
  };

  const topBorderStyle = {
    ...textCenter,
    borderTop: `1px solid ${ui.cardBorderColor}`
  };

  const nameStyle = {
    color: appTheme.palette.dark,
    display: 'block',
    fontSize: '20px',
    padding: '4px 0'
  };

  const userStats = {
    ...textCenter,
    padding: 0
  };

  const presentLabelStyles = {
    color: present ? appTheme.palette.cool : appTheme.palette.cool10g,
    fontFamily: ui.emailFontFamily,
    fontSize: '14px',
    fontStyle: 'italic',
    fontWeight: 600,
    padding: '0 0 8px'
  };

  const presentLabel = present ? 'Present' : 'Absent';

  const doneTasks = tasks.filter((task) => task.status === DONE);
  const newTasks = tasks.filter((task) => task.status !== DONE);
  const doneTasksLabel = `${doneTasks.length} ${plural(doneTasks.length, 'Task')} Done`;
  const newTasksLabel = `${newTasks.length} New ${plural(newTasks.length, 'Task')}`;

  const makeTaskGroup = (taskArr, label, space) =>
    (<tr>
      <td>
        <table align="center" width="100%">
          <tbody>
            <tr>
              <td style={userStats}>
                {taskArr.length > 0 &&
                  <span style={labelStyle}>
                    {label}
                  </span>
                }
              </td>
            </tr>
            <tr>
              <td align="center" style={cardsCell}>
                <TasksTable tasks={taskArr} />
                <EmptySpace height={space} />
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>);

  return (
    <table align="center" width="100%">
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
        {doneTasks.length > 0 && makeTaskGroup(doneTasks, doneTasksLabel, 8)}
        {/* New Tasks */}
        {newTasks.length > 0 && makeTaskGroup(newTasks, newTasksLabel, 24)}
      </tbody>
    </table>
  );
};

UserTasks.propTypes = {
  member: PropTypes.object.isRequired
};

export default UserTasks;
