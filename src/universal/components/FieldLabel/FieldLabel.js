import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import styled from 'react-emotion';

const FieldLabelStyles = styled('label')(({customStyles, fieldSize, indent, inline}) => {
  const size = fieldSize || ui.buttonSizeOptions[1];
  const paddingLeft = fieldSize && indent ? ui.controlBlockPaddingHorizontal[size] : 0;
  const inlineSizeStyles = ui.fieldSizeStyles[size];
  const inlineStyles = {
    lineHeight: inlineSizeStyles.lineHeight,
    paddingBottom: ui.controlBlockPaddingVertical[size],
    paddingTop: ui.controlBlockPaddingVertical[size]
  };
  const useInlineStyles = fieldSize && inline && inlineStyles;
  return {
    color: ui.labelHeadingColor,
    display: 'block',
    fontSize: ui.labelHeadingFontSize,
    fontWeight: ui.labelHeadingFontWeight,
    lineHeight: ui.labelHeadingLineHeight,
    letterSpacing: ui.labelHeadingLetterSpacing,
    padding: 0,
    textTransform: 'uppercase',
    // 1. Line up controls when inline
    ...useInlineStyles,
    // 2. Optionally line up left edge of text using indent bool
    paddingLeft,
    // 3. Do what ya want
    ...customStyles
  };
});

const FieldLabel = (props) => {
  const {customStyles, fieldSize, indent, inline, htmlFor, label} = props;
  return (
    <FieldLabelStyles
      customStyles={customStyles}
      fieldSize={fieldSize}
      indent={indent}
      inline={inline}
      htmlFor={htmlFor}
    >
      {label}
    </FieldLabelStyles>
  );
};

FieldLabel.propTypes = {
  customStyles: PropTypes.object,
  fieldSize: PropTypes.oneOf(ui.fieldSizeOptions),
  htmlFor: PropTypes.string,
  indent: PropTypes.bool,
  inline: PropTypes.bool,
  label: PropTypes.string,
  styles: PropTypes.object
};

export default FieldLabel;
