import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import {Menu, MenuItem} from 'universal/modules/menu';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const OutcomeCardAssignMenu = (props) => {
  const {
    cardHasFocus,
    cardHasHover,
    onComplete,
    outcome,
    owner,
    styles,
    team,
    teamMembers
  } = props;
  const {teamMemberId: currentOwner, id: outcomeId} = outcome;

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

  // !isArchived && !showTeam

  const avatarStyles = css(
    styles.avatar,
    cardHasHover && styles.avatarCardHasHover,
    cardHasFocus && styles.avatarCardHasFocus
  );
  const toggleButton = () =>
    <img
      alt={owner.preferredName}
      className={avatarStyles}
      src={owner.picture}
      tabIndex="0"
    />;

  const toggle = toggleButton();

  const itemFactory = () => {
    const items = [];
    teamMembers.map((teamMember) => {
      const isClickable = currentOwner !== teamMember.id;
      console.log(teamMember);
      items.push(
        <MenuItem
          avatar={teamMember.picture}
          isActive={!isClickable}
          label={teamMember.preferredName}
          onClick={() => handleProjectUpdate(teamMember.id)}
        />
      );
    });
    return items;
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
        {team}
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
  teamMembers: PropTypes.array,
  team: PropTypes.string
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    color: ui.palette.dark,
    display: 'flex',
    fontSize: '13px'
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
  },

  avatar: {
    borderRadius: '100%',
    border: '.125rem solid transparent',
    cursor: 'pointer',
    height: '1.75rem',
    marginLeft: '-.125rem',
    outline: 'none',
    position: 'relative',
    top: '.125rem',
    width: '1.75rem',
    ':hover': {
      borderColor: ui.palette.dark
    },
    ':focus': {
      borderColor: ui.palette.dark
    }
  },

  avatarCardHasHover: {
    borderColor: appTheme.palette.mid50l
  },

  avatarCardHasFocus: {
    borderColor: appTheme.palette.mid50l
  },

  teamName: {
    display: 'inline-block',
    fontWeight: 700,
    marginLeft: '.5rem'
  }
});

export default withStyles(styleThunk)(OutcomeCardAssignMenu);
