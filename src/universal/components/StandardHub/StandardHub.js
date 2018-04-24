import PropTypes from 'prop-types';
import React from 'react';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import {createFragmentContainer} from 'react-relay';
import {NavLink, withRouter} from 'react-router-dom';
import Avatar from 'universal/components/Avatar/Avatar';
import Badge from 'universal/components/Badge/Badge';
import {Menu, MenuItem} from 'universal/modules/menu';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';
import ui from 'universal/styles/ui';
import styled, {css} from 'react-emotion';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'left'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'left'
};

const StandardHubRoot = styled('div')({
  alignItems: 'center',
  borderBottom: ui.dashMenuBorder,
  display: 'flex',
  minHeight: ui.dashHeaderMinHeight,
  padding: '.5625rem 1rem',
  width: '100%'
});

const User = styled('div')({
  display: 'flex',
  cursor: 'pointer',
  flex: 1,
  position: 'relative',
  transition: `opacity ${ui.transition[0]}`,

  ':hover': {
    opacity: '.5'
  }
});

// Make a single clickable area, over user details, to trigger the menu
const MenuToggle = styled('div')({
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0
});

const PreferredName = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  fontSize: appTheme.typography.sBase,
  fontWeight: 600,
  maxWidth: '9rem',
  padding: '0 .25rem 0 1rem',
  '& > span': {...textOverflow}
});

const notificationsStyles = {
  alignItems: 'center',
  backgroundColor: ui.dashSidebarBackgroundColor,
  borderRadius: '2rem',
  display: 'flex',
  height: 32,
  justifyContent: 'center',
  position: 'relative',
  transition: `background-color ${ui.transition[0]}`,
  width: 32,
  '&:hover,:focus': {
    backgroundColor: ui.navMenuDarkBackgroundColorHover
  }
};

const notificationsWithBadge = {
  backgroundColor: ui.navMenuDarkBackgroundColorHover
};

const notificationsActive = {
  backgroundColor: ui.navMenuDarkBackgroundColorActive,
  '&:hover,:focus': {
    backgroundColor: ui.navMenuDarkBackgroundColorActive
  }
};

const BadgeBlock = styled('div')({
  bottom: '-.375rem',
  position: 'absolute',
  right: '-.375rem'
});

const UpgradeCTA = styled('div')({
  color: ui.palette.warm,
  cursor: 'pointer',
  flex: 1,
  paddingRight: ui.menuGutterHorizontal,
  textAlign: 'right',
  '&:hover': {
    textDecoration: 'underline'
  }
});

const MenuLabelWithCTA = styled('div')({
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  flex: 1,
  fontSize: ui.menuItemFontSize,
  justifyContent: 'space-between',
  lineHeight: ui.menuItemHeight,
  width: '100%'
});

const NotificationIcon = styled(StyledFontAwesome)({
  lineHeight: 'inherit',
  color: 'white'
});

const StandardHub = (props) => {
  const {history, viewer} = props;
  const notifications = viewer && viewer.notifications && viewer.notifications.edges;
  const notificationsCount = notifications ? notifications.length : 0;
  const {picture = '', preferredName = '', email = ''} = viewer || {};

  // nav menu routes
  const goToSettings = () => history.push('/me/settings');
  const goToOrganizations = () => history.push('/me/organizations');
  const goToNotifications = () => history.push('/me/notifications');
  const signOut = () => history.push('/signout');

  // TODO: get a real array of free orgs, clean this up (TA)
  // looking at a local org to test UI
  const showBillingNudgeCTA = true;
  const arrayFreeOrgs = showBillingNudgeCTA ? [{id: 'Hk6PztMhz'}] : [];

  const makeUpgradeCTA = () => {
    const label = 'Upgrade to Professional';
    let upgradeGoTo = goToOrganizations;
    if (arrayFreeOrgs.length === 1) {
      const {id} = arrayFreeOrgs[0];
      upgradeGoTo = () => history.push(`/me/organizations/${id}`);
    }
    return (
      <UpgradeCTA
        aria-label={label}
        onClick={upgradeGoTo}
        title={label}
      >
        {'Upgrade to '}<b>{'Professional'}</b>
      </UpgradeCTA>
    );
  };

  const organizationsLabel = () => {
    const label = 'Organizations';
    if (arrayFreeOrgs.length !== 0) {
      return (
        <MenuLabelWithCTA>
          <span
            aria-label={label}
            onClick={goToOrganizations}
            title={label}
          >
            {label}
          </span>
          {makeUpgradeCTA()}
        </MenuLabelWithCTA>
      );
    }
    return label;
  };

  const makeUserMenu = () => {
    const itemFactory = () => {
      const listItems = [];
      // scope click handlers to inner label and CTA if there are any free orgs
      const orgOnClick = arrayFreeOrgs.length === 0 ? goToOrganizations : null;
      listItems.push(
        <MenuItem icon="address-card" label="Settings" onClick={goToSettings} />,
        <MenuItem icon="building" label={organizationsLabel()} onClick={orgOnClick} />,
        <MenuItem icon="bell" label="Notifications" onClick={goToNotifications} />,
        <MenuItem icon="sign-out" label="Sign Out" onClick={signOut} hr="before" />
      );
      return listItems;
    };
    const menuWidth = arrayFreeOrgs.length !== 0 ? '21rem' : '13rem';
    return (
      <Menu
        itemFactory={itemFactory}
        label={email}
        originAnchor={originAnchor}
        maxHeight="none"
        menuWidth={menuWidth}
        targetAnchor={targetAnchor}
        toggle={<MenuToggle />}
      />
    );
  };

  const navLinkStyles = css(
    notificationsStyles,
    notificationsCount > 0 && notificationsWithBadge
  );

  const userAvatar = picture || defaultUserAvatar;

  return (
    <StandardHubRoot>
      <User>
        <Avatar hasBadge={false} picture={userAvatar} size="smaller" />
        <PreferredName><span>{preferredName}</span></PreferredName>
        {makeUserMenu()}
      </User>
      <NavLink
        activeClassName={css(notificationsActive)}
        className={navLinkStyles}
        to="/me/notifications"
      >
        <NotificationIcon name="bell" />
        {notificationsCount > 0 &&
        <BadgeBlock>
          <Badge value={notificationsCount} />
        </BadgeBlock>
        }
      </NavLink>
    </StandardHubRoot>
  );
};

StandardHub.propTypes = {
  notificationsCount: PropTypes.number,
  history: PropTypes.object,
  viewer: PropTypes.object
};

export default createFragmentContainer(
  withRouter(StandardHub),
  graphql`
    fragment StandardHub_viewer on User {
      email
      picture
      preferredName
      notifications(first: 100) @connection(key: "DashboardWrapper_notifications") {
        edges {
          node {
            id
          }
        }
      }
    }
  `
);
