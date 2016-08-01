import React, {Component, PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import CheckinCard from 'universal/modules/meeting/components/CheckinCard/CheckinCard';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class CheckinCards extends Component {
  static propTypes = {
    isFacilitator: PropTypes.bool,
    members: PropTypes.array,
    localPhaseItem: PropTypes.number,
    teamId: PropTypes.string
  };

  render() {
    const {isFacilitator, members, localPhaseItem, teamId} = this.props;
    const memberNumber = Number(localPhaseItem);
    const leftCard = memberNumber > 0 && members[memberNumber - 1];
    const rightCard = memberNumber < members.length - 1 && members[memberNumber + 1];
    const activeCard = members[memberNumber];
    // const showLowerBound = Math.max(0, memberNumber - 1);
    // const showMembers = members.slice(showLowerBound, memberNumber + 2);
    return (
      <div className={styles.base}>
        {leftCard && <CheckinCard member={leftCard} teamId={teamId}/>}
        <CheckinCard member={activeCard} isActive isFacilitator={isFacilitator} teamId={teamId}/>
        {rightCard && <CheckinCard member={rightCard} teamId={teamId}/>}
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
