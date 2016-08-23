import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
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
      cashay.mutate('checkin', options);
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
        {leftCard &&
          <CheckinCard handleCardClick={this.handleCardClickFactory(memberIdx - 1)} member={leftCard}/>
        }
        {activeCard &&
          <CheckinCard checkinPressFactory={makeCheckinPressFactory(activeCard.id)} member={activeCard} isActive/>
        }
        {rightCard &&
          <CheckinCard handleCardClick={this.handleCardClickFactory(memberIdx + 1)} member={rightCard}/>
        }
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
