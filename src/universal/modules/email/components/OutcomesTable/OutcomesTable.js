import React, {PropTypes} from 'react';
import Card from '../Card/Card';
import ui from 'universal/styles/ui';

const cardRowCell = {
  padding: '8px',
  verticalAlign: 'top',
  width: '188px'
};

const getOutcomeRows = (arr) => {
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
const makeOutcomeCards = (arr) => {
  return arr.map((card, idx) =>
    <td style={cardRowCell} key={`outcomeCard${idx}`}>
      <Card
        content={card.content}
        status={card.status}
      />
    </td>
  );
};

const OutcomesTable = (props) => {
  const outcomeRows = getOutcomeRows(props.outcomes);
  return (
    <table align="center" style={ui.emailTableBase}>
      <tbody>
        {outcomeRows.map((row, idx) =>
          <tr key={`outcomeRow${idx}`}>
            {makeOutcomeCards(row)}
          </tr>
      )}
      </tbody>
    </table>
  );
};
/* eslint-enable */
OutcomesTable.propTypes = {
  outcomes: PropTypes.array
};

export default OutcomesTable;
