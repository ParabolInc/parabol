import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import IconButton from 'universal/components/IconButton/IconButton';

const WelcomeSubmitButton = (props) => {
  const {disabled, styles} = props;
  return (
    <div className={css(styles.buttonBlock)}>
      <IconButton
        disabled={disabled}
        iconName="check-circle"
        iconSize="2x"
        type="submit"
      />
    </div>
  );
};

WelcomeSubmitButton.propTypes = {
  disabled: PropTypes.bool,
  styles: PropTypes.object,
};
const styleThunk = () => ({
  buttonBlock: {
    padding: '0 0 0 1rem',
  }
});

export default withStyles(styleThunk)(WelcomeSubmitButton);
