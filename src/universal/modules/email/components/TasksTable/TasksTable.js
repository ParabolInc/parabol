import PropTypes from 'prop-types';
import React from 'react';
import Card from '../Card/Card';
import ui from 'universal/styles/ui';
import arrayToRows from '../../helpers/arrayToRows';

const cardRowCell = {
  padding: '8px',
  verticalAlign: 'top',
  width: '188px'
};

/* eslint-disable react/no-array-index-key */
const makeTaskCards = (arr) => {
  return arr.map((card, idx) =>
    (<td style={cardRowCell} key={`taskCard${idx}`}>
      <Card
        content={card.content}
        status={card.status}
        tags={card.tags}
      />
    </td>)
  );
};

const TasksTable = (props) => {
  const taskRows = arrayToRows(props.tasks);
  return (
    <table align="center" style={ui.emailTableBase}>
      <tbody>
        {taskRows.map((row, idx) =>
          (<tr key={`taskRow${idx}`}>
            {makeTaskCards(row)}
          </tr>)
        )}
      </tbody>
    </table>
  );
};

/* eslint-enable */
TasksTable.propTypes = {
  tasks: PropTypes.array
};

export default TasksTable;
