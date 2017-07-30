import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import {Menu, MenuItem} from 'universal/modules/menu';
import appTheme from 'universal/styles/theme/appTheme';

const OutcomeCardAssignMenu = (props) => {
  const {
    cardHasFocus,
    cardHasHover,
    onComplete,
    outcome,
    owner,
    styles,
    teamMembers
  } = props;
  const {teamMemberId: currentOwner, id: outcomeId} = outcome;
  const teamName = outcome.team.name;

  const handleProjectUpdate = (newOwner) => {
    if (newOwner === currentOwner) {
      return;
    }
    const options = {
      ops: {},
      variables: {
        updatedProject: {
          id: outcomeId,
          teamMemberId: newOwner
        }
      }
    };
    cashay.mutate('updateProject', options);
    if (onComplete) {
      onComplete();
    }
  };

  // !isArchived

  const avatarStyles = css(
    styles.avatar,
    cardHasHover && styles.avatarCardHasHover,
    cardHasFocus && styles.avatarCardHasFocus
  );
  const toggleButton = () =>
    <div className={avatarStyles} tabIndex="0">
      <img
        alt={owner.preferredName}
        className={css(styles.avatarImg)}
        src={owner.picture}
      />
    </div>;

  const toggle = toggleButton();

  const itemFactory = () => {
    return teamMembers.map((teamMember) => {
      return (
        <MenuItem
          avatar={teamMember.picture}
          isActive={currentOwner === teamMember.id}
          label={teamMember.preferredName}
          onClick={() => handleProjectUpdate(teamMember.id)}
        />
      );
    });
  };

  const originAnchor = {
    vertical: 'bottom',
    horizontal: 'left'
  };

  const targetAnchor = {
    vertical: 'top',
    horizontal: 'left'
  };

  return (
    <div className={css(styles.root)}>
      <Menu
        itemFactory={itemFactory}
        maxHeight="9rem"
        originAnchor={originAnchor}
        targetAnchor={targetAnchor}
        toggle={toggle}
      />
      <div className={css(styles.teamName)}>
        {teamName}
      </div>
    </div>
  );
};

OutcomeCardAssignMenu.propTypes = {
  cardHasFocus: PropTypes.bool,
  cardHasHover: PropTypes.bool,
  onComplete: PropTypes.func,
  outcome: PropTypes.object,
  owner: PropTypes.object,
  styles: PropTypes.object,
  teamMembers: PropTypes.array
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    color: appTheme.palette.dark,
    display: 'flex',
    height: '1.5rem',
    fontSize: '13px'
  },

  avatar: {
    borderRadius: '100%',
    border: '.0625rem solid transparent',
    cursor: 'pointer',
    height: '1.75rem',
    marginLeft: '-.125rem',
    outline: 'none',
    padding: '.0625rem',
    position: 'relative',
    width: '1.75rem',

    ':hover': {
      borderColor: appTheme.palette.dark
    },
    ':focus': {
      borderColor: appTheme.palette.dark
    }
  },

  avatarCardHasHover: {
    borderColor: appTheme.palette.mid50l
  },

  avatarCardHasFocus: {
    borderColor: appTheme.palette.mid50l
  },

  avatarImg: {
    borderRadius: '100%',
    height: '1.5rem',
    width: '1.5rem'
  },

  teamName: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontWeight: 700,
    marginLeft: '.5rem'
  }
});

export default withStyles(styleThunk)(OutcomeCardAssignMenu);
