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
    fontSize: '13px'
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

  teamName: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontWeight: 700,
    marginLeft: '.5rem'
  }
});

export default withStyles(styleThunk)(OutcomeCardAssignMenu);
