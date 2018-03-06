import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const NavListItemLink = styled('div')(({status}) => ({borderRadius: '.25rem',
  height: '.25rem',
  marginRight: '.3125rem',
  width: '1.875rem'
}));

const NavItemBullet = styled('div')(({active, disabled, inSync, inPhase}) => ({
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
}));

const NavItemLabel = styled('div')(({active, disabled, inSync, inPhase}) => ({
  display: 'inline-block',
  fontSize: ui.navMenuFontSize,
  verticalAlign: 'middle'
}));

const NavListItem = styled('div')(({active, disabled, inSync, inPhase}) => ({
  fontSize: 0,
  fontWeight: 600,
  lineHeight: '2.5rem'
}));

const NavListItemLink = styled('div')(({active, disabled, inSync, inPhase}) => ({
  borderLeft: `${ui.navMenuLeftBorderWidth} solid transparent`,
  color: appTheme.palette.dark60l,
  cursor: 'pointer',
  textDecoration: 'none',
  userSelect: 'none',

  ':hover': {
    color: appTheme.palette.dark
  },
  ':focus': {
    color: appTheme.palette.dark
  }
}));

const NavListItemLinkDisabled = styled('div')(({active, disabled, inSync, inPhase}) => ({
  color: appTheme.palette.dark60l,
  cursor: 'not-allowed',
  opacity: '.65',

  ':hover': {
    color: appTheme.palette.dark60l
  },
  ':focus': {
    color: appTheme.palette.dark60l
  }
}));

const NavListItemMeetingMarker = styled('div')(({active, disabled, inSync, inPhase}) => ({
  position: 'relative',

  ':hover': {
    backgroundColor: appTheme.palette.warm,
    borderRadius: '100%',
    display: 'block',
    content: '""',
    height: '.75rem',
    marginTop: '-.375rem',
    position: 'absolute',
    right: '-.375rem',
    top: '50%',
    width: '.75rem'
  }
}));

const NavListItemLinkActive = styled('div')(({active, disabled, inSync, inPhase}) => ({
  backgroundColor: ui.navMenuLightBackgroundColorActive,
  borderLeftColor: ui.palette.mid,
  color: appTheme.palette.dark
}));

const MeetingNavItem = () => {
  <NavItemBase>
  </NavItemBase>
};

export default MeetingNavItem;
