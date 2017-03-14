import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import CheckinCard from 'universal/modules/meeting/components/CheckinCard/CheckinCard';
import CheckinCardBaseStyles from '../CheckinCard/CheckinCardBaseStyles';
import {cashay} from 'cashay';

const makeCheckinPressFactory = (teamMemberId, gotoNext) => (isCheckedIn) => () => {
  const options = {
    variables: {
      isCheckedIn,
      teamMemberId
    }
  };
  cashay.mutate('checkIn', options);
  gotoNext();
};

const CheckinCards = (props) => {
  const {gotoItem, gotoNext, members, localPhaseItem, styles} = props;
  const memberIdx = localPhaseItem - 1;
  const leftCard = memberIdx > 0 && members[memberIdx - 1];
  const rightCard = memberIdx < members.length && members[memberIdx + 1];
  const activeCard = members[memberIdx];
  return (
    <div className={css(styles.base)}>
      {leftCard ?
        <CheckinCard handleCardClick={() => gotoItem(localPhaseItem - 1)} member={leftCard} /> :
        <div className={css(styles.placeholder)} />
      }
      {activeCard &&
        <CheckinCard
          checkInPressFactory={makeCheckinPressFactory(activeCard.id, gotoNext)}
          member={activeCard}
          isActive
        />
      }
      {rightCard ?
        <CheckinCard handleCardClick={gotoNext} member={rightCard} /> :
        <div className={css(styles.placeholder)} />
      }
    </div>
  );
};

CheckinCards.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  members: PropTypes.array,
  localPhaseItem: PropTypes.number,
  styles: PropTypes.object,
};

const styleThunk = () => ({
  base: {
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem 0',
    width: '100%',

    [ui.breakpoint.wide]: {
      padding: '2rem 0'
    },

    [ui.breakpoint.wider]: {
      padding: '3rem 0'
    },

    [ui.breakpoint.widest]: {
      padding: '4rem 0'
    }
  },

  placeholder: {
    ...CheckinCardBaseStyles
  }
});

export default withStyles(styleThunk)(CheckinCards);
