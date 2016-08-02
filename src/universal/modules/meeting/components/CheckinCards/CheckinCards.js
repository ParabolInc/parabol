import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import CheckinCard from 'universal/modules/meeting/components/CheckinCard/CheckinCard';
import {CHECKIN} from 'universal/utils/constants';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import {cashay} from 'cashay';
import {withRouter} from 'react-router';

let styles = {};

@withRouter
@look
// eslint-disable-next-line react/prefer-stateless-function
export default class CheckinCards extends Component {
  static propTypes = {
    isFacilitator: PropTypes.bool,
    localPhaseItem: PropTypes.number,
    members: PropTypes.array,
    router: PropTypes.object.isRequired,
    teamId: PropTypes.string
  };

  handleCardClickFactory = (nextPhaseItem) => {
    const {isFacilitator, router, teamId} = this.props;
    const nextPhase = CHECKIN;
    return () => {
      if (isFacilitator) {
        const options = {variables: {nextPhase, nextPhaseItem, teamId}};
        cashay.mutate('moveMeeting', options);
      }
      const pushURL = makePushURL(teamId, nextPhase, nextPhaseItem);
      router.push(pushURL);
    };
  };

  makeCheckinPressFactory = (teamMemberId) => {
    const {teamId} = this.props;
    return (isCheckedIn) => {
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
  };

  render() {
    const {members, localPhaseItem} = this.props;
    const memberNumber = Number(localPhaseItem);
    const leftCard = memberNumber > 0 && members[memberNumber - 1];
    const rightCard = memberNumber < members.length - 1 && members[memberNumber + 1];
    const activeCard = members[memberNumber];

    return (
      <div className={styles.base}>
        {leftCard &&
          <CheckinCard
            handleCardClick={this.handleCardClickFactory(memberNumber - 1)}
            member={leftCard}
          />
        }
        {activeCard &&
          <CheckinCard
            checkinPressFactory={this.makeCheckinPressFactory(activeCard.id)}
            member={activeCard}
            isActive
          />
        }
        {rightCard &&
          <CheckinCard
            handleCardClick={this.handleCardClickFactory(memberNumber + 1)}
            member={rightCard}
          />
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
