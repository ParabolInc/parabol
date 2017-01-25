import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const InvoiceHeader = (props) => {
  const {
    styles
  } = props;

  return (
    <div className={css(styles.header)}>
      InvoiceHeader
    </div>
  );
};

InvoiceHeader.propTypes = {
  styles: PropTypes.object
};

InvoiceHeader.defaultProps = {
  // Define
};

const styleThunk = () => ({
  header: {
    // Define
  }
});

export default withStyles(styleThunk)(InvoiceHeader);
