import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import Card from '../../components/Card/Card';

let styles = {};

const demoUser = {
  name: '@KittyKitterson',
  image: 'https://placekitten.com/g/600/600',
  badge: null, // absent || active || present
  state: 'invited' // invited || not attending || fully present
};

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
    return (
      <div className={styles.base}>
        <Card avatar={demoUser} label={demoUser.state} />
        <Card active avatar={demoUser} hasControls label={demoUser.state} />
        <Card avatar={demoUser} label={demoUser.state} />
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
