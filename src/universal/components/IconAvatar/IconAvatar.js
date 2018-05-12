import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const smallSize = '2rem';
const mediumSize = '2.75rem';
const largeSize = '4rem';

const iconSizes = {
  small: {
    fontSize: ui.iconSize,
    height: smallSize,
    width: smallSize
  },

  medium: {
    fontSize: ui.iconSizeAvatar,
    height: mediumSize,
    width: mediumSize
  },

  large: {
    fontSize: ui.iconSize2x,
    height: largeSize,
    width: largeSize
  }
};

const IconAvatarRoot = styled('div')(({size}) => {
  const {fontSize, height, width} = iconSizes[size];
  return {
    alignItems: 'center',
    backgroundColor: appTheme.palette.mid70l,
    borderRadius: '100%',
    color: '#fff',
    display: 'flex',
    fontSize,
    height,
    justifyContent: 'center',
    textAlign: 'center',
    width
  };
});

const IconStyled = styled(StyledFontAwesome)({
  fontSize: 'inherit',
  lineHeight: ui.iconSize
});

const IconAvatar = (props) => {
  const {icon, size, title} = props;
  return (
    <IconAvatarRoot size={size || 'small'} title={title || 'Icon Avatar'}>
      <IconStyled name={icon} />
    </IconAvatarRoot>
  );
};

IconAvatar.propTypes = {
  icon: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  title: PropTypes.string
};

export default IconAvatar;
