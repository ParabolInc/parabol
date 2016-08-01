import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import Avatar from 'universal/components/Avatar/Avatar';
import PushButton from 'universal/components/PushButton/PushButton';
import {cashay} from 'cashay';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import {CHECKIN} from 'universal/utils/constants';
import {withRouter} from 'react-router';
import withHotkey from 'react-hotkey-hoc';

const combineStyles = StyleSheet.combineStyles;

let styles = {};

const makeCheckinHandler = (isCheckedIn, teamId, teamMemberId) => {
  return () => {
    const options = {
      variables: {
        isCheckedIn,
        teamId,
        teamMemberId
      }
    };
    cashay.mutate('checkin', options);
  };
};

const CardButtons = (props) => {
  const {bindHotkey, teamId, teamMemberId} = props;

  const handleOnClickPresent = makeCheckinHandler(true, teamId, teamMemberId);
  const handleOnClickAbsent = makeCheckinHandler(false, teamId, teamMemberId);
  bindHotkey('c', handleOnClickPresent);
  bindHotkey('x', handleOnClickAbsent);
  return (
    <div className={styles.buttonsBlock}>
      <PushButton handleOnClick={handleOnClickPresent} keystroke="c" label="ok, let’s do this!" size="large"/>
      <PushButton handleOnClick={handleOnClickAbsent} keystroke="x" label="can’t make this one" size="large"/>
    </div>
  );
};

CardButtons.propTypes = {
  bindHotkey: PropTypes.func.isRequired,
  teamId: PropTypes.string.isRequired,
  teamMemberId: PropTypes.string.isRequired
};

const Card = (props) => {
  const {bindHotkey, isActive, isFacilitator, member, router, teamId} = props;

  const cardActiveStyles = combineStyles(styles.card, styles.cardIsActive);
  const cardBlurredStyles = combineStyles(styles.card, styles.cardIsBlurred);
  const cardStyles = isActive ? cardActiveStyles : cardBlurredStyles;
  const nameActiveStyles = combineStyles(styles.cardName, styles.cardNameActive);
  const nameStyles = isActive ? nameActiveStyles : styles.cardName;
  let labelStyles = styles.cardLabel;
  if (member.isCheckedIn) {
    labelStyles = combineStyles(styles.cardLabel, styles.cardLabelPresent);
  }
  const handleCardClick = () => {
    const nextPhase = CHECKIN;
    const nextPhaseItem = props.member.checkInOrder;
    if (isFacilitator) {
      const options = {variables: {nextPhase, nextPhaseItem, teamId}};
      cashay.mutate('advanceFacilitator', options);
    }
    const pushURL = makePushURL(teamId, nextPhase, nextPhaseItem);
    router.push(pushURL);
  };
  return (
    <div className={cardStyles} onClick={!isActive && handleCardClick}>
      <Avatar {...member} size="largest"/>
      <div className={nameStyles}>{member.preferredName}</div>
      <div className={labelStyles}>Checking in...</div>
      {isActive && <CardButtons bindHotkey={bindHotkey} teamId={teamId} teamMemberId={member.id}/>}
    </div>
  );
};

Card.propTypes = {
  bindHotkey: PropTypes.func.isRequired,
  hasControls: PropTypes.bool,
  isActive: PropTypes.bool,
  isFacilitator: PropTypes.bool,
  label: PropTypes.string,
  member: PropTypes.object,
  router: PropTypes.object.isRequired,
  teamId: PropTypes.string
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

export default withHotkey(withRouter(look(Card)));
