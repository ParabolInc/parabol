import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const FieldShortcutHint = (props) => {
  const {disabled, hint, styles} = props;
  const shortcutHintStyles = css(
    styles.shortcutHint,
    disabled && styles.disabled
  );
  return (
    <div className={shortcutHintStyles}>
      {hint}
    </div>
  );
};

FieldShortcutHint.propTypes = {
  disabled: PropTypes.bool,
  hint: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  shortcutHint: {
    color: appTheme.palette.warm,
    cursor: 'default',
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    lineHeight: appTheme.typography.s5,
    padding: `${ui.fieldLabelGutter} 0 0`,
    textAlign: 'right'
  },

  disabled: {
    opacity: '.5'
  }
});

export default withStyles(styleThunk)(FieldShortcutHint);
