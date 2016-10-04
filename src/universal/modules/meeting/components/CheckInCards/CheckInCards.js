import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import CheckInCard from 'universal/modules/meeting/components/CheckInCard/CheckInCard';
import {CHECKIN} from 'universal/utils/constants';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import {cashay} from 'cashay';
import {withRouter} from 'react-router';

const makeCheckinPressFactory = (teamMemberId) => {
  return (isCheckedIn) => {
    return () => {
      const options = {
        variables: {
          isCheckedIn,
          teamMemberId
        }
      };
      cashay.mutate('checkIn', options);
    };
  };
};

const CheckInCards = (props) => {
  const handleCardClickFactory = (nextPhaseItem) => {
    const {isFacilitating, router, teamId} = props;
    const nextPhase = CHECKIN;
    return () => {
      if (isFacilitating) {
        const options = {variables: {nextPhase, nextPhaseItem, teamId}};
        cashay.mutate('moveMeeting', options);
      }
      const pushURL = makePushURL(teamId, nextPhase, nextPhaseItem);
      router.push(pushURL);
    };
  };

  const {members, localPhaseItem, styles} = props;
  const memberIdx = localPhaseItem - 1;
  const leftCard = memberIdx > 0 && members[memberIdx - 1];
  const rightCard = memberIdx < members.length && members[memberIdx + 1];
  const activeCard = members[memberIdx];

  return (
    <div className={css(styles.base)}>
      {leftCard ?
        <CheckInCard handleCardClick={handleCardClickFactory(localPhaseItem - 1)} member={leftCard}/> :
        <div className={css(styles.placeholder)}></div>
      }
      {activeCard &&
        <CheckInCard checkInPressFactory={makeCheckinPressFactory(activeCard.id)} member={activeCard} isActive/>
      }
      {rightCard ?
        <CheckInCard handleCardClick={handleCardClickFactory(localPhaseItem + 1)} member={rightCard}/> :
        <div className={css(styles.placeholder)}></div>
      }
    </div>
  );
};

CheckInCards.propTypes = {
  isFacilitating: PropTypes.bool,
  members: PropTypes.array,
  localPhaseItem: PropTypes.number,
  router: PropTypes.object,
  styles: PropTypes.object,
  teamId: PropTypes.string
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

export default withStyles(styleThunk)(withRouter(CheckInCards));
