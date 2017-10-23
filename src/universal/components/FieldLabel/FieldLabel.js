import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const FieldLabel = (props) => {
  const {
    htmlFor,
    label,
    styles
  } = props;
  return (
    <label className={css(styles.fieldLabel)} htmlFor={htmlFor}>
      {label}
    </label>
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

const styleThunk = (theme, {customStyles, fieldSize, indent, inline}) => {
  const size = fieldSize || ui.buttonSizeOptions[1];
  const paddingLeft = (fieldSize && indent) ? ui.controlBlockPaddingHorizontal[size] : 0;
  const inlineSizeStyles = ui.fieldSizeStyles[size];
  const inlineStyles = {
    lineHeight: inlineSizeStyles.lineHeight,
    paddingBottom: ui.controlBlockPaddingVertical[size],
    paddingTop: ui.controlBlockPaddingVertical[size]
  };
  const useInlineStyles = (fieldSize && inline) && inlineStyles;
  return ({
    fieldLabel: {
      color: appTheme.palette.dark,
      display: 'block',
      fontSize: appTheme.typography.sBase,
      fontWeight: 700,
      lineHeight: appTheme.typography.s5,
      padding: 0,
      // 1. Line up controls when inline
      ...useInlineStyles,
      // 2. Optionally line up left edge of text using indent bool
      paddingLeft,
      // 3. Do what ya want
      ...customStyles
    }
  });
};

export default withStyles(styleThunk)(FieldLabel);
