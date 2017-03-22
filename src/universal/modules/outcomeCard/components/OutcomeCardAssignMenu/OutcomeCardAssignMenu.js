import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import Avatar from 'universal/components/Avatar/Avatar';
import getOutcomeNames from 'universal/utils/getOutcomeNames';

const OutcomeCardAssignMenu = (props) => {
  const {onComplete, outcome, styles, teamMembers} = props;
  const {teamMemberId: currentOwner, id: outcomeId} = outcome;

  const handleProjectUpdate = (newOwner) => {
    if (newOwner === currentOwner) {
      return;
    }
    const {argName, mutationName} = getOutcomeNames(outcome, 'update');
    const options = {
      ops: {},
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
    <div className={css(styles.root)}>
      {
        teamMembers.map((teamMember) => {
          const isClickable = currentOwner !== teamMember.id;
          const menuItemStyles = css(styles.menuItem, isClickable && styles.menuItemClickable);
          return (
            <div className={menuItemStyles} key={`menuItem${teamMember.id}`}>
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
  styles: PropTypes.object,
  teamMembers: PropTypes.array
};

const styleThunk = () => ({
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

export default withStyles(styleThunk)(OutcomeCardAssignMenu);
