import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import CheckinCard from 'universal/modules/meeting/components/CheckinCard/CheckinCard';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class CheckinCards extends Component {
  static propTypes = {
    members: PropTypes.array,
    localPhaseItem: PropTypes.number,
    teamId: PropTypes.string
  };

  render() {
    const {members, localPhaseItem, teamId} = this.props;
    return (
      <div className={styles.base}>
        {members.map((member, idx) => <CheckinCard key={`card${member.id}`} member={member} isActive={idx === Number(localPhaseItem)} teamId={teamId}/>)}
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
