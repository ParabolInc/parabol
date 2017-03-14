import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import Avatar from 'universal/components/Avatar/Avatar';
import CheckinCardBaseStyles from './CheckinCardBaseStyles';
import CheckinCardButtons from 'universal/modules/meeting/components/CheckinCardButtons/CheckinCardButtons';
import {withRouter} from 'react-router';

const CheckinCard = (props) => {
  const {
    checkInPressFactory,
    handleCardClick,
    isActive,
    member,
    styles
  } = props;
  const {
    isCheckedIn,
    preferredName
  } = member;
  const cardStyles = css(
    styles.card,
    isActive ? styles.cardIsActive : styles.cardIsBlurred
  );
  return (
    <div className={cardStyles} onClick={!isActive && handleCardClick}>
      <Avatar {...member} size="largest" />
      <div className={css(styles.cardName)}>{preferredName}</div>
      {isActive && <CheckinCardButtons checkInPressFactory={checkInPressFactory} isCheckedIn={isCheckedIn} />}
    </div>
  );
};

CheckinCard.propTypes = {
  checkInPressFactory: PropTypes.func,
  handleCardClick: PropTypes.func,
  isActive: PropTypes.bool,
  member: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = () => ({
  card: {
    ...CheckinCardBaseStyles,
    borderColor: appTheme.palette.mid50l
  },

  cardIsActive: {
    boxShadow: '0 2px 1px 1px rgba(0, 0, 0, .15)'
  },

  cardIsBlurred: {
    filter: ui.filterBlur,
    opacity: '.65',
    position: 'relative',
    transform: 'scale(.75)'
  },

  cardName: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s6,
    fontWeight: 400,
    margin: '1rem 0 2rem'
  }
});

export default withRouter(withStyles(styleThunk)(CheckinCard));
