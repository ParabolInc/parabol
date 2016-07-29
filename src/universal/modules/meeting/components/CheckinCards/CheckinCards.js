import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import CheckinCard from 'universal/modules/meeting/components/CheckinCard/CheckinCard';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class CheckinCards extends Component {
  static propTypes = {
    cards: PropTypes.array,
    localPhaseItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    teamId: PropTypes.string
  };

  render() {
    const {cards, localPhaseItem, teamId} = this.props;
    return (
      <div className={styles.base}>
        {cards.map((card, idx) => <CheckinCard key={`card${card.id}`} avatar={card} active={idx === localPhaseItem} teamId={teamId}/>)}
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
