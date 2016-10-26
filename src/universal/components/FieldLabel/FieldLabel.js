import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const FieldLabel = (props) => {
  const {htmlFor, label, styles} = props;
  return (
    <label className={css(styles.fieldLabel)} htmlFor={htmlFor}>
      {label}
    </label>
  );
};

FieldLabel.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  fieldLabel: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.sBase,
    fontWeight: 700,
    lineHeight: appTheme.typography.s5,
    padding: `0 ${ui.fieldPaddingHorizontal}`,
  }
});

export default withStyles(styleThunk)(FieldLabel);
