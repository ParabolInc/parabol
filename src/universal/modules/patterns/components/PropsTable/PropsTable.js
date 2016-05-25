import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class PropsTable extends Component {
  static propTypes = {
    propsList: PropTypes.array
  }

  render() {
    return (
      <table className={styles.base}>
        <tbody>
          <tr className={styles.row}>
            <th className={styles.header}>Prop</th>
            <th className={styles.header}>Type</th>
            <th className={styles.header}>Description</th>
          </tr>
          {
            this.props.propsList.map((item, index) =>
              <tr className={styles.row} key={index}>
                <td className={styles.cell}>{item.name}</td>
                <td className={styles.cell}>{item.type}</td>
                <td className={styles.cell}>{item.description}</td>
              </tr>
            )
          }
        </tbody>
      </table>
    );
  }
}

styles = StyleSheet.create({
  base: {
    borderCollapse: 'collapse',
    borderSpacing: 0,
    margin: '2rem auto 8rem',
    width: '100%'
  },
  header: {
    padding: '.5rem .5rem .5rem 0',
    textAlign: 'left'
  },
  row: {
    // Define
  },
  cell: {
    borderTop: '1px solid #e8e8e8',
    padding: '.5rem .5rem .5rem 0'
  }
});
