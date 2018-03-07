import React from 'react';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

// Meeting Nav Item states
// -- default
// -- active (I am here)
// -- disabled
// -- isPhase (experiment with agenda > items each having active)
// -- inSync (shows a dot when I’m not tethered, consider just using the bullet color)

// const NavListItemLink = styled('div')(({status}) => ({borderRadius: '.25rem',
//   height: '.25rem',
//   marginRight: '.3125rem',
//   width: '1.875rem'
// }));

const NavItemBullet = styled('div')(({active, disabled, isPhase, inSync}) => ({
  backgroundColor: isPhase ? appTheme.palette.warm : appTheme.palette.mid,
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

const NavItemLabel = styled('div')(({active, disabled, isPhase, inSync}) => ({
  display: 'inline-block',
  fontSize: ui.navMenuFontSize,
  verticalAlign: 'middle'
}));

const NavListItem = styled('div')(({active, disabled, isPhase, inSync}) => ({
  fontSize: 0,
  fontWeight: 600,
  lineHeight: '2.5rem'
}));

const NavListItemLink = styled('div')(({active, disabled, isPhase, inSync}) => ({
  backgroundColor: active ? ui.navMenuLightBackgroundColorActive : 'transparent',
  borderLeft: `${ui.navMenuLeftBorderWidth} solid`,
  borderLeftColor: active ? ui.palette.mid : 'transparent',
  color: ui.colorText,
  cursor: disabled ? 'not-allowed' : 'pointer',
  // opacity: disabled && '.65',
  textDecoration: 'none',
  userSelect: 'none',

  '&:focus,:active': {
    color: !disabled && ui.navMenuLightBackgroundColorActive
  }
}));

// const NavListItemLinkActive = styled('div')(({active, disabled, isPhase, inSync}) => ({
//   backgroundColor: ui.navMenuLightBackgroundColorActive,
//   borderLeftColor: ui.palette.mid,
//   color: appTheme.palette.dark
// }));

// const NavListItemLinkDisabled = styled('div')(({active, disabled, isPhase, inSync}) => ({
//   color: appTheme.palette.dark60l,
//   cursor: 'not-allowed',
//   opacity: '.65',
//
//   ':hover': {
//     color: appTheme.palette.dark60l
//   },
//   ':focus': {
//     color: appTheme.palette.dark60l
//   }
// }));

const NavListItemMeetingMarker = styled('div')(({active, disabled, isPhase, inSync}) => ({
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

type Props = {
  active: boolean,
  'aria-label': string,
  bullet: string,
  disabled: boolean,
  isPhase: boolean,
  inSync: boolean,
  label: string,
  onClick?: () => any,
  title: string,
  // // The draft-js content for this card
  // contentState: ContentState,
  // // The action to take when this card is deleted
  // handleDelete?: () => any,
  // // The action to take when this card is saved
  // handleSave?: (editorState: EditorState) => any,
  // // True when this card is being hovered over by a valid drag source
  // hovered?: boolean,
  // // True when the current user is the one dragging this card
  // iAmDragging?: boolean,
  // // If the `userDragging` prop is provided, this states whether it serves as
  // // the under-the-mouse dragged card, or the sitting-where-it-came-from card.
  // pulled?: boolean,
  // // The stage of the meeting this was created during
  // stage?: Stage,
  // // The name of the user who is currently dragging this card to a new place, if any
  // userDragging?: string,
};

// const navLinkStyles = css(
//
// )

const MeetingNavItem = (props) => {
  const {
    active,
    'aria-label': ariaLabel,
    bullet,
    disabled,
    isPhase,
    inSync,
    label,
    onClick,
    title
  } = props;
  return (
    <NavListItem>
      <NavListItemLink aria-label={ariaLabel} onClick={onClick} title={title}>
        <NavItemBullet>{bullet}</NavItemBullet>
        <NavItemLabel>{label}</NavItemLabel>
      </NavListItemLink>
    </NavListItem>
  );
};

export default MeetingNavItem;
