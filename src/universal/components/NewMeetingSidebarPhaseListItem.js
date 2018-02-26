// @flow
import React from 'react';
import styled, {css, cx} from 'react-emotion';
import appTheme from 'universal/styles/theme/appTheme';

const navListItem = css({
  fontSize: 0,
  fontWeight: 700,
  lineHeight: '2.5rem'
});

const facilitatorActiveNavListItem = css({
  position: 'relative',
  '::after': {
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
});

const navListItemLink = css({
  color: appTheme.palette.dark60l,
  cursor: 'pointer',
  textDecoration: 'none',
  userSelect: 'none',
  '&:hover,:focus': {
    color: appTheme.palette.dark
  }
});

const navListItemLinkActive = css({
  color: appTheme.palette.dark
});

const navListItemLinkDisabled = css({
  color: appTheme.palette.dark60l,
  cursor: 'not-allowed',
  opacity: '.65',
  '&:hover,:focus': {
    color: appTheme.palette.dark60l
  }
});

const ListPrefix = styled('span')({
  display: 'inline-block',
  fontSize: appTheme.typography.s4,
  marginRight: '.75rem',
  textAlign: 'right',
  verticalAlign: 'middle',
  width: '3rem'
});

const GroupLabel = styled('span')({
  display: 'inline-block',
  fontSize: appTheme.typography.s4,
  verticalAlign: 'middle'
});

// type Props = {
//   name:
// }

const NewMeetingSidebarPhaseListItem = (props) => {
  const {handleClick, name, listPrefix, isActive, isFacilitatorPhaseGroup, isNavigable} = props;
  return (
    <li className={cx(navListItem, isFacilitatorPhaseGroup && facilitatorActiveNavListItem)}>
      <div
        className={cx(navListItemLink, !isNavigable && navListItemLinkDisabled, isActive && navListItemLinkActive)}
        onClick={handleClick}
        title={name}
      >
        <ListPrefix>{listPrefix}</ListPrefix>
        <GroupLabel>{name}</GroupLabel>
      </div>
    </li>
  )
};

export default NewMeetingSidebarPhaseListItem;
