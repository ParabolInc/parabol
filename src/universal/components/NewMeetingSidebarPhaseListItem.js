// @flow
import React from 'react';
import styled, {css} from 'react-emotion';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const NavListItem = styled('li')({
  fontSize: 0,
  fontWeight: 600,
  lineHeight: '2.5rem'
});

const NavItemBullet = styled('span')(
  {
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
  },
  ({isFacilitatorPhaseGroup}) => ({
    backgroundImage: isFacilitatorPhaseGroup && ui.gradientWarm
  })
);

const NavItemLabel = styled('span')({
  display: 'inline-block',
  fontSize: ui.navMenuFontSize,
  verticalAlign: 'middle'
});

const navListItemLinkActive = css({
  backgroundColor: ui.navMenuLightBackgroundColorActive,
  borderLeftColor: ui.palette.mid,
  color: appTheme.palette.dark,
  ':hover,:focus': {
    backgroundColor: ui.navMenuLightBackgroundColorActive
  }
});

const navListItemLinkDisabled = css({
  cursor: 'not-allowed',
  ':hover,:focus': {
    backgroundColor: 'transparent'
  }
});

const NavListItemLink = styled('div')(
  {
    borderLeft: `${ui.navMenuLeftBorderWidth} solid transparent`,
    color: ui.colorText,
    cursor: 'pointer',
    textDecoration: 'none',
    userSelect: 'none',
    ':hover,:focus': {
      backgroundColor: ui.navMenuLightBackgroundColorHover
    }
  },
  ({isDisabled}) => isDisabled && navListItemLinkDisabled,
  ({isActive}) => isActive && navListItemLinkActive
);

type Props = {
  handleClick: ?() => void,
  name: string,
  listPrefix: string,
  isActive: boolean,
  isFacilitatorPhaseGroup: boolean
};

const NewMeetingSidebarPhaseListItem = (props: Props) => {
  const {handleClick, name, listPrefix, isActive, isFacilitatorPhaseGroup} = props;
  return (
    <NavListItem>
      <NavListItemLink isDisabled={!handleClick} isActive={isActive} onClick={handleClick} title={name}>
        <NavItemBullet isFacilitatorPhaseGroup={isFacilitatorPhaseGroup}>{listPrefix}</NavItemBullet>
        <NavItemLabel>{name}</NavItemLabel>
      </NavListItemLink>
    </NavListItem>
  );
};

export default NewMeetingSidebarPhaseListItem;

