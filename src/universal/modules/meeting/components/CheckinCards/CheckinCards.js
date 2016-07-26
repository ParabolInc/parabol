import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import CheckinCard from 'universal/modules/meeting/components/CheckinCard/CheckinCard';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class CheckinCards extends Component {
  static propTypes = {
    cards: PropTypes.array
  };

  render() {
    const {cards, localPhaseItem} = this.props;
    console.log('localPhase', localPhaseItem);
    // TODO: testing rendering of data from backend for now
    return (
      <div className={styles.base}>
        {cards.map((card, idx) => <CheckinCard avatar={card} active={idx === localPhaseItem}/>)}
      </div>
    );
  }
}

styles = StyleSheet.create({
  base: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  }
});
