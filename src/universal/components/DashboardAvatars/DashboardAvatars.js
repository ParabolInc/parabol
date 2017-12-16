import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import Avatar from 'universal/components/Avatar/Avatar';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';
import withStyles from 'universal/styles/withStyles';

const DashboardAvatars = (props) => {
  const {team: {teamMembers}, styles} = props;
  return (
    <div className={css(styles.root)}>
      {
        teamMembers.map((avatar) => {
          const picture = avatar.picture || defaultUserAvatar;
          return (
            <div className={css(styles.item)} key={`dbAvatar${avatar.id}`}>
              <Avatar
                {...avatar}
                picture={picture}
                hasBadge
                isCheckedIn={avatar.isCheckedIn}
                isConnected={avatar.isConnected || avatar.isSelf}
                size="smaller"
              />
            </div>
          );
        })
      }
    </div>
  );
};

DashboardAvatars.propTypes = {
  styles: PropTypes.object,
  team: PropTypes.object.isRequired
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    width: '100%'
  },

  item: {
    margin: '0 0 0 1rem',
    position: 'relative'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(DashboardAvatars),
  graphql`
    fragment DashboardAvatars_team on Team {
      teamMembers(sortBy: "preferredName") {
        id
        isCheckedIn
        isConnected
        isSelf
        picture
      }
    }`
);

