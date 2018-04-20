import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import styled from 'react-emotion';

const lineHeight = ui.navTopicLineHeight;

const ItemRoot = styled('div')(
  ({isActive, isComplete, isDisabled, onClick}) => ({
    backgroundColor: !isDisabled && isActive && ui.navMenuLightBackgroundColorActive,
    boxShadow: !isDisabled && isActive && `inset ${ui.navMenuLeftBorderWidth} 0 0 ${ui.palette.mid}`,
    color: onClick ? ui.colorLink : ui.colorText,
    display: 'flex',
    fontSize: ui.navTopicFontSize,
    fontWeight: 400,
    minHeight: '2.5rem',
    opacity: !isActive && isComplete && 0.5,
    padding: '.5rem 0',
    position: 'relative',
    width: '100%',
    '&:hover': {
      backgroundColor: onClick && !isActive && appTheme.palette.light50l,
      cursor: !isActive && onClick && 'pointer',
      opacity: !isDisabled && 1
    }
  }),
  ({isOutOfSync}) => isOutOfSync && ({
    color: ui.palette.warm,
    opacity: 1,
    '&::after': {
      backgroundColor: ui.palette.warm,
      borderRadius: '100%',
      content: '""',
      display: 'block',
      left: '.875rem',
      marginTop: '-.1875rem',
      position: 'absolute',
      height: '.375rem',
      top: '50%',
      transition: 'opacity .1s ease-in',
      width: '.375rem'
    }
  })
);

const ItemOrderLabel = styled('div')(({isDisabled}) => ({
  height: lineHeight,
  lineHeight,
  // overrides hover state using !important only during disabled
  opacity: isDisabled ? '.5 !important' : '.5',
  paddingRight: '.75rem',
  textAlign: 'right',
  width: ui.meetingSidebarGutterInner
}));

const ItemLabel = styled('div')(({hasQuotes}) => ({
  color: 'inherit',
  fontSize: appTheme.typography.s3,
  flex: 1,
  lineHeight,
  position: 'relative',
  wordBreak: 'break-word',

  '&::before': {
    content: hasQuotes && '"“"',
    display: 'block',
    position: 'absolute',
    right: '100%',
    textAlign: 'right',
    width: '1rem'
  }
}));

const ItemLabelInner = styled('span')(({isComplete, onClick}) => ({
  color: 'inherit',
  textDecoration: isComplete && 'line-through'
}));

const ItemMeta = styled('div')({
  paddingLeft: '.25rem'
});

const MeetingSubnavItem = (props) => {
  const {
    hasQuotes,
    isActive,
    isComplete,
    isDisabled,
    isOutOfSync,
    label,
    metaContent,
    onClick,
    orderLabel
  } = props;

  return (
    <ItemRoot
      isActive={isActive}
      isComplete={isComplete}
      isDisabled={isDisabled}
      isOutOfSync={isOutOfSync}
      onClick={!isDisabled ? onClick : null}
    >
      <ItemOrderLabel isDisabled={isDisabled}>
        {orderLabel}
      </ItemOrderLabel>
      <ItemLabel hasQuotes={hasQuotes}>
        <ItemLabelInner
          isComplete={isComplete}
          isDisabled={isDisabled}
          onClick={!isDisabled ? onClick : null}
        >
          {label}
        </ItemLabelInner>
        {hasQuotes && <span>{'”'}</span>}
      </ItemLabel>
      <ItemMeta>
        {metaContent}
      </ItemMeta>
    </ItemRoot>
  );
};

MeetingSubnavItem.propTypes = {
  hasQuotes: PropTypes.bool,
  isActive: PropTypes.bool,
  isComplete: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isOutOfSync: PropTypes.bool,
  label: PropTypes.string,
  metaContent: PropTypes.any,
  onClick: PropTypes.func,
  orderLabel: PropTypes.string
};

export default MeetingSubnavItem;
