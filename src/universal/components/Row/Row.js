import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';

const Row = (props) => {
  const {
    children,
    styles
  } = props;

  return (
    <div className={css(styles.userRow)}>
      {children}
    </div>
  );
};

Row.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  userRow: {
    alignItems: 'center',
    borderTop: `1px solid ${ui.rowBorderColor}`,
    display: 'flex',
    justifyContent: 'space-between',
    padding: ui.rowGutter,
    width: '100%'
  }
});

export default withStyles(styleThunk)(Row);
