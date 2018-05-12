import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';
import Type from 'universal/components/Type/Type';
import styled from 'react-emotion';

const RootBlock = styled('div')(({margin}) => ({
  alignItems: 'center',
  display: 'flex',
  margin: margin || 0,
  whiteSpace: 'nowrap'
}));

const StyledIcon = styled(FontAwesome)({
  color: ui.colorText,
  fontSize: ui.iconSize,
  marginRight: '.5rem'
});

const DashSectionHeading = (props) => {
  const {icon, label, margin} = props;
  return (
    <RootBlock margin={margin}>
      {icon && <StyledIcon name={icon} />}
      <Type lineHeight={ui.dashControlHeight} scale="s4" colorPalette="dark">
        {label}
      </Type>
    </RootBlock>
  );
};

DashSectionHeading.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  margin: PropTypes.string
};

export default DashSectionHeading;
