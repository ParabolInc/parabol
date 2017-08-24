import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';

const Row = (props) => {
  const {
    children,
    style,
    styles
  } = props;

  return (
    <div className={css(styles.row)} style={style}>
      {children}
    </div>
  );
};

Row.propTypes = {
  children: PropTypes.any,
  style: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = () => ({
  row: {
    alignItems: 'center',
    borderTop: `.0625rem solid ${ui.rowBorderColor}`,
    display: 'flex',
    justifyContent: 'space-between',
    padding: ui.rowGutter,
    width: '100%'
  }
});

export default withStyles(styleThunk)(Row);
