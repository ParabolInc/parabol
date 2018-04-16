// @flow
import React from 'react';
import ui from 'universal/styles/ui';
import TasksTable from '../TasksTable/TasksTable';
import EmptySpace from '../../components/EmptySpace/EmptySpace';

const cardsCell = {
  padding: '8px',
  textAlign: 'center'
};

const labelStyle = {
  display: 'inline-block',
  fontFamily: ui.emailFontFamily,
  fontSize: '14px',
  fontWeight: 600,
  verticalAlign: 'middle'
};

const userStats = {
  fontFamily: ui.emailFontFamily,
  textAlign: 'center',
  padding: 0
};

type Props = {
  label: string,
  space: number,
  tasks: Array<Object>
};

const MeetingMemberTaskListItem = (props: Props) => {
  const {tasks, label, space} = props;
  if (tasks.length === 0) return null;
  return (
    <tr>
      <td>
        <table align="center" width="100%">
          <tbody>
            <tr>
              <td style={userStats}>
                {tasks.length > 0 &&
                <span style={labelStyle}>
                  {label}
                </span>
                }
              </td>
            </tr>
            <tr>
              <td align="center" style={cardsCell}>
                <TasksTable tasks={tasks} />
                <EmptySpace height={space} />
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  );
};

export default MeetingMemberTaskListItem;
