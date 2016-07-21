import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import Card from '../Card/Card';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class CardStage extends Component {
  static propTypes = {
    cards: PropTypes.array
  };

  // TODO: Set up to cycle through
  //       previous, active, and next (LTR)
  //       in a list of cards
  //       Control with AdvanceLink or AvatarGroup > Avatar onClick

  // getCurrentCardIndex(cards) {
  //   let currentIndex;
  //   cards.map((card, index) => {
  //     if (card.isCurrent === true) {
  //       currentIndex = index;
  //     }
  //     return currentIndex;
  //   });
  // }

  render() {
    const {cards} = this.props;
    const card = cards[0];

    // TODO: testing rendering of data from backend for now
    return (
      <div className={styles.base}>
        <Card avatar={card} label={card.state} />
        <Card active avatar={card} hasControls label={card.state} />
        <Card avatar={card} label={card.state} />
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
