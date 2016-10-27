import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const FieldHelpText = (props) => {
  const {hasErrorText, helpText, resetPadding, styles} = props;
  const helpTextStyles = css(
    styles.fieldHelpText,
    hasErrorText && styles.error,
    resetPadding && styles.resetPadding
  );
  return (
    <div className={helpTextStyles}>
      {helpText}
    </div>
  );
};

FieldHelpText.propTypes = {
  align: PropTypes.oneOf([
    'center',
    'left'
  ]),
  hasErrorText: PropTypes.bool,
  helpText: PropTypes.any,
  resetPadding: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = (customTheme, props) => ({
  fieldHelpText: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s3,
    lineHeight: appTheme.typography.s5,
    padding: `${ui.fieldLabelGutter} ${ui.fieldPaddingHorizontal} 0`,
    textAlign: props.align
  },

  error: {
    color: appTheme.palette.warm
  },

  resetPadding: {
    padding: `${ui.fieldLabelGutter} 0 0`
  }
});

export default withStyles(styleThunk)(FieldHelpText);
