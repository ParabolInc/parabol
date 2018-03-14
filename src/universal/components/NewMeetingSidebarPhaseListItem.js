// @flow
import React from 'react';
import styled, {css, cx} from 'react-emotion';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const navListItem = css({
  fontSize: 0,
  fontWeight: 600,
  lineHeight: '2.5rem'
});

const navItemBullet = css({
  backgroundColor: appTheme.palette.mid,
  borderRadius: '100%',
  color: ui.palette.white,
  display: 'inline-block',
  fontSize: '.6875rem',
  fontWeight: ui.typeSemiBold,
  height: '1.5rem',
  lineHeight: '1.5rem',
  marginLeft: '1.3125rem',
  marginRight: '.75rem',
  textAlign: 'center',
  verticalAlign: 'middle',
  width: '1.5rem'
});

const navItemBulletPhase = css({
  backgroundImage: ui.gradientWarm
});

const NavItemLabel = styled('span')({
  display: 'inline-block',
  fontSize: ui.navMenuFontSize,
  verticalAlign: 'middle'
});

const navListItemLink = css({
  borderLeft: `${ui.navMenuLeftBorderWidth} solid transparent`,
  color: ui.colorText,
  cursor: 'pointer',
  textDecoration: 'none',
  userSelect: 'none',
  '&:hover,:focus': {
    backgroundColor: ui.navMenuLightBackgroundColorHover
  }
});

const navListItemLinkActive = css({
  backgroundColor: ui.navMenuLightBackgroundColorActive,
  borderLeftColor: ui.palette.mid,
  color: appTheme.palette.dark,
  '&:hover,:focus': {
    backgroundColor: ui.navMenuLightBackgroundColorActive
  }
});

const navListItemLinkDisabled = css({
  cursor: 'not-allowed',
  '&:hover,:focus': {
    backgroundColor: 'transparent'
  }
});

type Props = {
  handleClick: () => void,
  name: string,
  listPrefix: string,
  isActive: boolean,
  isFacilitatorPhaseGroup: boolean,
  isNavigable: boolean
};

const NewMeetingSidebarPhaseListItem = (props: Props) => {
  const {handleClick, name, listPrefix, isActive, isFacilitatorPhaseGroup, isNavigable} = props;
  return (
    <li className={cx(navListItem)}>
      <div
        className={cx(navListItemLink, !isNavigable && navListItemLinkDisabled, isActive && navListItemLinkActive)}
        onClick={handleClick}
        title={name}
      >
        <span className={cx(navItemBullet, isFacilitatorPhaseGroup && navItemBulletPhase)}>{listPrefix}</span>
        <NavItemLabel>{name}</NavItemLabel>
      </div>
    </li>
  );
};

export default NewMeetingSidebarPhaseListItem;

