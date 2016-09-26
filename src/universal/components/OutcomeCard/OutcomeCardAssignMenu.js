import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {cashay} from 'cashay';
import Avatar from 'universal/components/Avatar/Avatar';
import getOutcomeNames from 'universal/utils/getOutcomeNames';

let s = {};
const combineStyles = StyleSheet.combineStyles;

const OutcomeCardAssignMenu = (props) => {
  const {onComplete, outcome, teamMembers} = props;
  const {teamMemberId: currentOwner, id: outcomeId} = outcome;

  const handleProjectUpdate = (newOwner) => {
    if (newOwner === currentOwner) {
      return;
    }
    const {argName, mutationName} = getOutcomeNames(outcome, 'update');
    const options = {
      variables: {
        [argName]: {
          id: outcomeId,
          teamMemberId: newOwner
        }
      }
    };
    cashay.mutate(mutationName, options);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className={s.root}>
      {
        teamMembers.map((teamMember, idx) => {
          const isClickable = currentOwner !== teamMember.preferredName;
          const menuItemStyles = isClickable ? combineStyles(s.menuItem, s.menuItemClickable) : s.menuItem;
          return (
            <div className={menuItemStyles} key={`menuItem${idx}`}>
              <Avatar
                {...teamMember}
                isClickable={isClickable}
                hasBadge={false}
                onClick={() => handleProjectUpdate(teamMember.id)}
                size="smallest"
              />
            </div>
          );
        })
      }
    </div>
  );
};

OutcomeCardAssignMenu.propTypes = {
  onComplete: PropTypes.func,
  outcome: PropTypes.object,
  teamMembers: PropTypes.array
};

s = StyleSheet.create({
  root: {
    fontSize: 0,
    minHeight: '75px', // based on 120px
    padding: '.5rem',
    textAlign: 'center',
    width: '100%'
  },

  menuItem: {
    display: 'inline-block',
    fontSize: '1rem',
    margin: '.5rem',
    opacity: '.65'
  },

  menuItemClickable: {
    opacity: 1,

    ':hover': {
      opacity: '.5'
    },
    ':focus': {
      opacity: '.5'
    }
  }
});

export default look(OutcomeCardAssignMenu);
