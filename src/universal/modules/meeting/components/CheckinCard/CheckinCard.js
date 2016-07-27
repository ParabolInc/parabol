import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import Avatar from 'universal/components/Avatar/Avatar';
import PushButton from 'universal/components/PushButton/PushButton';

const combineStyles = StyleSheet.combineStyles;

let styles = {};

const CardButtons = () => {
  return (
    <div className={styles.buttonsBlock}>
      <PushButton keystroke="c" label="ok, let’s do this!" size="large" />
      <PushButton keystroke="x" label="can’t make this one" size="large" />
    </div>
  );
};

const Card = (props) => {
  const {active, avatar} = props;

  const cardActiveStyles = combineStyles(styles.card, styles.cardIsActive);
  const cardBlurredStyles = combineStyles(styles.card, styles.cardIsBlurred);
  const cardStyles = active ? cardActiveStyles : cardBlurredStyles;
  const nameActiveStyles = combineStyles(styles.cardName, styles.cardNameActive);
  const nameStyles = active ? nameActiveStyles : styles.cardName;
  let labelStyles = styles.cardLabel;

  if (avatar.isCheckedIn) {
    labelStyles = combineStyles(styles.cardLabel, styles.cardLabelPresent);
  }
  return (
    <div className={cardStyles}>
      <Avatar {...avatar} size="largest"/>
      <div className={nameStyles}>{avatar.preferredName}</div>
      <div className={labelStyles}>Checking in...</div>
      {active && <CardButtons/>}
    </div>
  );
};

Card.propTypes = {
  active: PropTypes.bool,
  avatar: PropTypes.object, // avatar.preferredName, avatar.picture, avatar.badge
  hasControls: PropTypes.bool,
  label: PropTypes.string
};

styles = StyleSheet.create({
  card: {
    border: `1px solid ${theme.palette.mid50l}`,
    borderRadius: '.5rem',
    margin: '0 .5rem',
    padding: '3rem 1rem 1.5rem',
    textAlign: 'center',
    width: '18.75rem'
  },

  cardIsActive: {
    borderColor: theme.palette.cool70l
  },

  cardIsBlurred: {
    filter: 'blur(1.5px)',
    opacity: '.65',
    position: 'relative',
    transform: 'scale(.75)'
  },

  cardName: {
    fontSize: theme.typography.s6,
    fontWeight: 400,
    margin: '1rem 0 .5rem'
  },

  cardNameActive: {
    color: theme.palette.cool
  },

  cardLabel: {
    color: theme.palette.dark50l,
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s4,
    fontStyle: 'italic',
    fontWeight: 400,
    margin: '.5rem 0 1rem'
  },

  cardLabelPresent: {
    color: theme.palette.cool
  },

  buttonsBlock: {
    display: 'inline-block'
  }
});

export default look(Card);
