import React, {PropTypes} from 'react';
import Card from '../../components/Card/Card';

const OutcomesTable = (props) => {
  const cardRowCell = {
    padding: '8px',
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

  const outcomeRows = getOutcomeRows(props.outcomes);

  const makeOutcomeCards = (arr) => {
    const cards = () =>
      arr.map(card =>
        <td style={cardRowCell} vAlign="top">
          <Card
            content={card.content}
            status={card.status}
            team={card.team}
            type={card.type}
          />
        </td>
      );
    return cards();
  };

  return (
    <table align="center">
      {outcomeRows.map(row =>
        <tr>
          {makeOutcomeCards(row)}
        </tr>
      )}
    </table>
  );
};

OutcomesTable.propTypes = {
  outcomes: PropTypes.array
};

export default OutcomesTable;
