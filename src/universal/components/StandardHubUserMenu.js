import React from 'react';
import MenuWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuWithShortcuts';
import appTheme from 'universal/styles/theme/appTheme';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import MenuItemWithShortcuts from 'universal/modules/menu/components/MenuItem/MenuItemWithShortcuts';
import MenuItemHR from 'universal/modules/menu/components/MenuItem/MenuItemHR';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import type {RouterHistory} from 'react-router-dom';
import {StandardHubUserMenu_viewer as Viewer} from './__generated__/StandardHubUserMenu_viewer.graphql';
import {PERSONAL, PRO_LABEL} from 'universal/utils/constants';
import textOverflow from 'universal/styles/helpers/textOverflow';

const Label = styled('div')({
  ...textOverflow,
  borderBottom: `1px solid ${appTheme.palette.mid30l}`,
  color: ui.palette.dark,
  fontSize: ui.menuItemFontSize,
  fontWeight: 600,
  lineHeight: ui.menuItemHeight,
  marginBottom: ui.menuGutterVertical,
  padding: `0 ${ui.menuGutterHorizontal}`,
  userSelect: 'none'
});

const UpgradeCTA = styled('span')({
  color: ui.upgradeColor,
  fontSize: ui.menuItemFontSize,
  lineHeight: ui.menuItemHeight,
  marginRight: '0.5rem'
});

type Props = {|
  closePortal: () => void,
  history: RouterHistory,
  viewer: Viewer
|};
const StandardHubUserMenu = (props: Props) => {
  const {
    closePortal,
    history,
    viewer: {email, organizations}
  } = props;

  // nav menu routes
  const goToSettings = () => history.push('/me/settings');
  const goToOrganizations = () => history.push('/me/organizations');
  const goToNotifications = () => history.push('/me/notifications');
  const signOut = () => history.push('/signout');

  const ownedFreeOrgs = organizations.filter((org) => org.tier === PERSONAL);
  const showUpgradeCTA = ownedFreeOrgs.length > 0;

  const makeUpgradeMenuLabel = (
    <UpgradeCTA>
      {'Upgrade to '}
      <b>{PRO_LABEL}</b>
    </UpgradeCTA>
  );

  const handleUpgradeClick = () => {
    const routeSuffix = ownedFreeOrgs.length === 1 ? `/${ownedFreeOrgs[0].id}` : '';
    history.push(`/me/organizations${routeSuffix}`);
  };

  return (
    <MenuWithShortcuts ariaLabel={'Select your settings'} closePortal={closePortal}>
      <Label>{email}</Label>
      <MenuItemWithShortcuts icon="address-card" label="Settings" onClick={goToSettings} />
      <MenuItemWithShortcuts icon="building" label="Organizations" onClick={goToOrganizations} />
      <MenuItemWithShortcuts icon="bell" label="Notifications" onClick={goToNotifications} />
      {showUpgradeCTA && <MenuItemHR key="HR0" notMenuItem />}
      {showUpgradeCTA && (
        <MenuItemWithShortcuts
          icon="star"
          label={makeUpgradeMenuLabel}
          onClick={handleUpgradeClick}
        />
      )}
      <MenuItemHR key="HR1" notMenuItem />
      <MenuItemWithShortcuts icon="sign-out" label="Sign Out" onClick={signOut} />
    </MenuWithShortcuts>
  );
};

export default createFragmentContainer(
  withRouter(StandardHubUserMenu),
  graphql`
    fragment StandardHubUserMenu_viewer on User {
      email
      organizations {
        id
        tier
      }
    }
  `
);
