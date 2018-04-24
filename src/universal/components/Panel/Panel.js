import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const bgThemeValues = {
  light: appTheme.palette.yellow30l,
  white: ui.palette.white
};

const PanelRoot = styled('div')(({bgTheme}) => ({
  backgroundColor: bgTheme ? bgThemeValues[bgTheme] : bgThemeValues.white,
  boxShadow: ui.panelBoxShadow,
  borderRadius: ui.cardBorderRadius,
  fontSize: appTheme.typography.s3,
  lineHeight: appTheme.typography.s5,
  margin: `${ui.panelMarginVertical} 0`,
  position: 'relative',
  width: '100%'
}));

const PanelHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
});

const PanelLabel = styled('div')(({compact}) => ({
  color: ui.labelHeadingColor,
  fontSize: ui.labelHeadingFontSize,
  fontWeight: ui.labelHeadingFontWeight,
  letterSpacing: ui.labelHeadingLetterSpacing,
  lineHeight: ui.labelHeadingLineHeight,
  padding: `.75rem ${compact ? ui.panelCompactGutter : ui.panelGutter}`,
  textTransform: 'uppercase'
}));

const PanelControls = styled('div')(({compact}) => ({
  display: 'flex',
  flex: 1,
  height: '2.75rem',
  justifyContent: 'flex-end',
  lineHeight: '2.75rem',
  paddingRight: compact ? ui.panelCompactGutter : ui.panelGutter
}));

const PanelBody = styled('div')(({hideFirstRowBorder}) => ({
  display: 'block',
  marginTop: hideFirstRowBorder && '-.0625rem',
  width: '100%'
}));

const Panel = (props) => {
  const {
    bgTheme,
    children,
    compact,
    controls,
    hideFirstRowBorder,
    label
  } = props;

  return (
    <PanelRoot bgTheme={bgTheme}>
      {label &&
        <PanelHeader>
          <PanelLabel compact={compact}>
            {label}
          </PanelLabel>
          <PanelControls>
            {controls}
          </PanelControls>
        </PanelHeader>
      }
      {/*
          NOTE: “hideFirstRowBorder”
          children may only be a set of rows,
          and in the absense of a panel header,
          we may want to avoid fuzzies by hiding
          the first row’s top border
      */}
      <PanelBody hideFirstRowBorder={hideFirstRowBorder}>
        {children}
      </PanelBody>
    </PanelRoot>
  );
};

Panel.propTypes = {
  bgTheme: PropTypes.oneOf([
    'light',
    'white'
  ]),
  children: PropTypes.any,
  compact: PropTypes.bool,
  controls: PropTypes.any,
  hideFirstRowBorder: PropTypes.bool,
  label: PropTypes.any
};

export default Panel;
