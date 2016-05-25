import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
// import FontAwesome from 'react-fontawesome';
// import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';
import Avatar from '../../components/Avatar/Avatar';
import PushButton from '../../components/PushButton/PushButton';

const combineStyles = StyleSheet.combineStyles;

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Card extends Component {
  static propTypes = {
    active: PropTypes.bool,
    avatar: PropTypes.object, // avatar.name, avatar.image, avatar.badge
    hasControls: PropTypes.bool,
    label: PropTypes.string
  };

  render() {
    const { active, avatar, hasControls, label } = this.props;

    const cardActiveStyles = combineStyles(styles.card, styles.cardIsActive);
    const cardBlurredStyles = combineStyles(styles.card, styles.cardIsBlurred);
    const cardStyles = active ? cardActiveStyles : cardBlurredStyles;
    const cardLabel = label || 'invited';
    const nameActiveStyles = combineStyles(styles.cardName, styles.cardNameActive);
    const nameStyles = active ? nameActiveStyles : styles.cardName;
    let labelStyles = styles.cardLabel;

    if (avatar.badge === 'present') {
      labelStyles = combineStyles(styles.cardLabel, styles.cardLabelPresent);
    }

    return (
      <div className={cardStyles}>
        {/* NOTE: Not using the <Avatar /> label. Using card name styles. */}
        <Avatar badge={avatar.badge} image={avatar.image} size="largest" />
        <div className={nameStyles}>{avatar.name}</div>
        <div className={labelStyles}>{cardLabel}</div>
        {hasControls &&
          <div className={styles.cardControls}>
            <PushButton size="large" />
            <PushButton size="large" />
          </div>
        }
      </div>
    );
  }
}

styles = StyleSheet.create({
  card: {
    border: '1px solid #b3b6c5',
    borderRadius: '.5rem',
    margin: '0 .5rem',
    padding: '3rem 1rem 1.5rem',
    textAlign: 'center',
    width: '18.75rem',
  },

  cardIsActive: {
    borderColor: '#53afb1',
  },

  cardIsBlurred: {
    filter: 'blur(1.5px)',
    position: 'relative',
    transform: 'scale(.75)',

    '::after': {
      // @include position-all(0, absolute);
      backgroundColor: 'rgba(255, 255, 255, .85)',
      content: '""',
      display: 'block',
      zIndex: '$zi-6',
    }
  },

  cardName: {
    fontSize: theme.typography.fs6,
    fontWeight: 400,
    margin: '1rem 0 .5rem',

  },

  cardNameActive: {
    color: theme.palette.cool
  },

  cardLabel: {
    color: '#a7a4af',
    fontFamily: theme.typography.actionUISerif,
    fontSize: theme.typography.fs4,
    fontStyle: 'italic',
    fontWeight: 400,
    margin: '.5rem 0 1rem'
  },

  cardLabelPresent: {
    color: theme.palette.cool
  },

  cardControls: {
    display: 'inline-block',
  }
});
