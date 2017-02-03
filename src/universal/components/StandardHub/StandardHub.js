import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {textOverflow} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';
import FontAwesome from 'react-fontawesome';
import {Link, withRouter} from 'react-router';
import Avatar from 'universal/components/Avatar/Avatar';
import Badge from 'universal/components/Badge/Badge';
import {Menu, MenuItem} from 'universal/modules/menu';

const faStyle = {
  lineHeight: 'inherit',
  color: 'white'
};

const StandardHub = (props) => {
  const {
    email,
    notificationsCount,
    picture,
    preferredName,
    router,
    styles
  } = props;

  const originAnchor = {
    vertical: 'bottom',
    horizontal: 'left'
  };

  const targetAnchor = {
    vertical: 'top',
    horizontal: 'left'
  };

  const goToSettings = () =>
    router.push('/me/settings');

  const goToOrganizations = () =>
    router.push('/me/organizations');

  const goToNotifications = () =>
    router.push('/me/notifications');

  const signOut = () =>
    router.push('/signout');

  const makeUserMenu = () => {
    const itemFactory = () => {
      const listItems = [];
      listItems.push(
        <MenuItem label="Settings" onClick={goToSettings}/>,
        <MenuItem label="Organizations" onClick={goToOrganizations}/>,
        <MenuItem label="Notifications" onClick={goToNotifications}/>,
        <MenuItem hr="before" label="Sign Out" onClick={signOut}/>
      );
      return listItems;
    };
    return (
      <Menu
        itemFactory={itemFactory}
        originAnchor={originAnchor}
        label={email}
        menuWidth="12rem"
        targetAnchor={targetAnchor}
        toggle={
          <div className={css(styles.user)}>
            <Avatar hasBadge={false} picture={picture} size="small"/>
            <div className={css(styles.info)}>
              <div className={css(styles.name)}>{preferredName}</div>
              <div className={css(styles.email)}>{email}</div>
            </div>
          </div>
        }
      />
    );
  };

  return (
    <div className={css(styles.root)}>
      {makeUserMenu()}
      <Link isActive={css(styles.notificationsActive)} to="/me/notifications" className={css(styles.notifications)}>
        <FontAwesome name="bell" style={faStyle}/>
        {notificationsCount > 0 &&
          <div className={css(styles.badgeBlock)}>
            <Badge value={notificationsCount} />
          </div>
        }
      </Link>
    </div>
  );
};

StandardHub.propTypes = {
  email: PropTypes.string,
  notificationsCount: PropTypes.number,
  picture: PropTypes.string,
  preferredName: PropTypes.string,
  router: PropTypes.object,
  styles: PropTypes.object
};

StandardHub.defaultProps = {
  notificationsCount: 88
};

const maxWidth = '8.25rem';
const styleThunk = () => ({
  root: {
    alignItems: 'center',
    borderBottom: '2px solid rgba(0, 0, 0, .10)',
    display: 'flex',
    minHeight: '4.875rem',
    padding: '1rem',
    width: '100%'
  },

  user: {
    display: 'flex',
    cursor: 'pointer',
    flex: 1,
    transition: `opacity ${ui.transitionFastest}`,

    ':hover': {
      opacity: '.5'
    }
  },

  info: {
    alignItems: 'flex-start',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: '1rem'
  },

  name: {
    ...textOverflow,
    fontSize: appTheme.typography.sBase,
    fontWeight: 700,
    lineHeight: '1.375rem',
    maxWidth,
    paddingTop: '.125rem'
  },

  email: {
    ...textOverflow,
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.sBase,
    marginTop: '.125rem',
    maxWidth
  },

  notifications: {
    alignItems: 'center',
    backgroundColor: appTheme.palette.dark50a,
    borderRadius: ui.buttonBorderRadius,
    display: 'flex',
    height: 32,
    justifyContent: 'center',
    position: 'relative',
    transition: `background-color ${ui.transitionFastest}`,
    width: 32,

    ...makeHoverFocus({
      backgroundColor: appTheme.palette.dark
    })
  },

  notificationsActive: {
    opacity: '.5'
  },

  badgeBlock: {
    bottom: '-.375rem',
    position: 'absolute',
    right: '-.375rem'
  }
});

export default withRouter(withStyles(styleThunk)(StandardHub));
