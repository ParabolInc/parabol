import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const EditingStatus = (props) => {
  const {status, styles, handleClick} = props;
  return (
    <div className={css(styles.timestamp)} onClick={handleClick}>
      {status}
    </div>
  );
};

EditingStatus.propTypes = {
  handleClick: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  styles: PropTypes.object.isRequired
};

const styleThunk = () => ({
  timestamp: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s1,
    fontWeight: 700,
    lineHeight: appTheme.typography.s3,
    padding: `.25rem ${ui.cardPaddingBase}`,
    textAlign: 'right'
  }
});

export default withStyles(styleThunk)(EditingStatus);
