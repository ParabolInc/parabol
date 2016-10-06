import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import CheckInCard from 'universal/modules/meeting/components/CheckInCard/CheckInCard';
import {cashay} from 'cashay';

const makeCheckinPressFactory = (teamMemberId) => (isCheckedIn) => () => {
  const options = {
    variables: {
      isCheckedIn,
      teamMemberId
    }
  };
  cashay.mutate('checkIn', options);
};

const CheckInCards = (props) => {
  const {gotoItem, members, localPhaseItem, styles} = props;
  const memberIdx = localPhaseItem - 1;
  const leftCard = memberIdx > 0 && members[memberIdx - 1];
  const rightCard = memberIdx < members.length && members[memberIdx + 1];
  const activeCard = members[memberIdx];

  return (
    <div className={css(styles.base)}>
      {leftCard ?
        <CheckInCard handleCardClick={() => gotoItem(localPhaseItem - 1)} member={leftCard}/> :
        <div className={css(styles.placeholder)}></div>
      }
      {activeCard &&
        <CheckInCard checkInPressFactory={makeCheckinPressFactory(activeCard.id)} member={activeCard} isActive/>
      }
      {rightCard ?
        <CheckInCard handleCardClick={() => gotoItem(localPhaseItem + 1)} member={rightCard}/> :
        <div className={css(styles.placeholder)}></div>
      }
    </div>
  );
};

CheckInCards.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  members: PropTypes.array,
  localPhaseItem: PropTypes.number,
  styles: PropTypes.object,
};

const styleThunk = () => ({
  base: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },

  placeholder: {
    // NOTE: This box model matches CheckInCard for exact sizing (TA)
    border: '1px solid transparent',
    borderRadius: '.5rem',
    margin: '0 .5rem',
    padding: '3rem 1rem 1.5rem',
    width: '18.75rem'
  }
});

export default withStyles(styleThunk)(CheckInCards);
