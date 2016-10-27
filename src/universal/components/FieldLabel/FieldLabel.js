import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const FieldLabel = (props) => {
  const {htmlFor, label, resetPadding, styles} = props;
  const labelStyles = css(
    styles.fieldLabel,
    resetPadding && styles.resetPadding
  );
  return (
    <label className={labelStyles} htmlFor={htmlFor}>
      {label}
    </label>
  );
};

FieldLabel.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.string,
  resetPadding: PropTypes.bool,
  styles: PropTypes.object
};

const styleThunk = () => ({
  fieldLabel: {
    color: appTheme.palette.dark,
    display: 'block',
    fontSize: appTheme.typography.sBase,
    fontWeight: 700,
    lineHeight: appTheme.typography.s5,
    padding: `0 ${ui.fieldPaddingHorizontal} ${ui.fieldLabelGutter}`,
  },

  resetPadding: {
    padding: `0 0 ${ui.fieldLabelGutter}`
  }
});

export default withStyles(styleThunk)(FieldLabel);
