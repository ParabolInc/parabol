import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const FieldHelpText = (props) => {
  const {hasErrorText, helpText, styles} = props;
  const helpTextStyles = css(
    styles.fieldHelpText,
    hasErrorText && styles.error
  );
  return (
    <div className={helpTextStyles}>
      {helpText}
    </div>
  );
};

FieldHelpText.propTypes = {
  fieldSize: PropTypes.oneOf(ui.fieldSizeOptions),
  hasErrorText: PropTypes.bool,
  helpText: PropTypes.any,
  indent: PropTypes.bool,
  styles: PropTypes.object
};


const styleThunk = (theme, {fieldSize, indent}) => {
  const size = fieldSize || ui.fieldSizeOptions[1];
  const paddingLeft = (fieldSize && indent) ? ui.controlBlockPaddingHorizontal[size] : 0;
  return ({
    fieldHelpText: {
      color: appTheme.palette.dark,
      cursor: 'default',
      fontSize: appTheme.typography.s3,
      lineHeight: appTheme.typography.s5,
      padding: `${ui.fieldLabelGutter} 0 0`,
      paddingLeft
    },

    error: {
      color: appTheme.palette.warm
    }
  });
};

export default withStyles(styleThunk)(FieldHelpText);
