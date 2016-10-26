import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

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
  hasErrorText: PropTypes.bool,
  helpText: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  fieldHelpText: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700
  },

  error: {
    color: appTheme.palette.warm
  }
});

export default withStyles(styleThunk)(FieldHelpText);
