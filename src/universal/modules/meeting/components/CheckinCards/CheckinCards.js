import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import CheckinCard from 'universal/modules/meeting/components/CheckinCard/CheckinCard';
import {CHECKIN} from 'universal/utils/constants';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import {cashay} from 'cashay';
import {withRouter} from 'react-router';

let styles = {};

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

@withRouter
@look
// eslint-disable-next-line react/prefer-stateless-function
export default class CheckinCards extends Component {
  static propTypes = {
    isFacilitating: PropTypes.bool,
    members: PropTypes.array,
    localPhaseItem: PropTypes.number,
    router: PropTypes.object,
    teamId: PropTypes.string
  };

  handleCardClickFactory = (nextPhaseItem) => {
    const {isFacilitating, router, teamId} = this.props;
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

  render() {
    const {members, localPhaseItem} = this.props;
    const memberIdx = localPhaseItem - 1;
    const leftCard = memberIdx > 0 && members[memberIdx - 1];
    const rightCard = memberIdx < members.length && members[memberIdx + 1];
    const activeCard = members[memberIdx];

    return (
      <div className={styles.base}>
        {leftCard ?
          <CheckinCard handleCardClick={this.handleCardClickFactory(memberIdx - 1)} member={leftCard}/> :
          <div className={styles.placeholder}></div>
        }
        {activeCard &&
          <CheckinCard checkInPressFactory={makeCheckinPressFactory(activeCard.id)} member={activeCard} isActive/>
        }
        {rightCard ?
          <CheckinCard handleCardClick={this.handleCardClickFactory(memberIdx + 1)} member={rightCard}/> :
          <div className={styles.placeholder}></div>
        }
      </div>
    );
  }
}

const styleThunk = () => ({
  base: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },

  placeholder: {
    // NOTE: This box model matches CheckinCard for exact sizing (TA)
    border: '1px solid transparent',
    borderRadius: '.5rem',
    margin: '0 .5rem',
    padding: '3rem 1rem 1.5rem',
    width: '18.75rem'
  }
});
