import PropTypes from 'prop-types';
import React from 'react';
import Card from '../Card/Card';
import ui from 'universal/styles/ui';

const cardRowCell = {
  padding: '8px',
  verticalAlign: 'top',
  width: '188px'
};

const getProjectRows = (arr) => {
  const rows = [];
  const length = arr.length;
  const rowLength = 3;
  for (let i = 0; i < length; i += rowLength) {
    const subArr = arr.slice(i, i + rowLength);
    rows.push(subArr);
  }
  return rows;
};

/* eslint-disable react/no-array-index-key */
const makeProjectCards = (arr) => {
  return arr.map((card, idx) =>
    (<td style={cardRowCell} key={`projectCard${idx}`}>
      <Card
        content={card.content}
        status={card.status}
        tags={card.tags}
      />
    </td>)
  );
};

const ProjectsTable = (props) => {
  const projectRows = getProjectRows(props.projects);
  return (
    <table align="center" style={ui.emailTableBase}>
      <tbody>
        {projectRows.map((row, idx) =>
          (<tr key={`projectRow${idx}`}>
            {makeProjectCards(row)}
          </tr>)
        )}
      </tbody>
    </table>
  );
};

/* eslint-enable */
ProjectsTable.propTypes = {
  projects: PropTypes.array
};

export default ProjectsTable;
