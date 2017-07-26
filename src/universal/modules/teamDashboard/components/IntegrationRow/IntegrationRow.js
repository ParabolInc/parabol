import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';

const IntegrationRow = (props) => {
  const {
    children,
    styles
  } = props;

  return (
    <div className={css(styles.row)}>
      {children}
    </div>
  );
};

IntegrationRow.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  row: {
    alignItems: 'center',
    borderTop: `1px solid ${ui.rowBorderColor}`,
    display: 'flex',
    justifyContent: 'space-between',
    padding: ui.rowGutter,
    paddingLeft: 0,
    width: '100%'
  }
});

export default withStyles(styleThunk)(IntegrationRow);
