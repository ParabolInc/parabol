import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {cashay} from 'cashay';
import Avatar from 'universal/components/Avatar/Avatar';
import exampleTeam from 'universal/modules/patterns/helpers/exampleTeam';

let s = {};
const defaultExampleTeam = exampleTeam.teamMembers.slice(0);
const combineStyles = StyleSheet.combineStyles;

const OutcomeCardAssignMenu = (props) => {
  const {currentOwner, onComplete, projectId, teamMembers} = props;

  const handleProjectUpdate = (newOwner) => {
    if (newOwner === currentOwner) {
      return;
    }
    const options = {
      variables: {
        updatedProject: {
          id: projectId,
          teamMemberId: newOwner
        }
      }
    };
    cashay.mutate('updateProject', options);
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
  currentOwner: PropTypes.string,
  onComplete: PropTypes.func,
  projectId: PropTypes.string,
  teamMembers: PropTypes.array
};

OutcomeCardAssignMenu.defaultProps = {
  currentOwner: 'Marimar',
  teamMembers: defaultExampleTeam
};

s = StyleSheet.create({
  root: {
    padding: '.5rem',
    fontSize: 0,
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
