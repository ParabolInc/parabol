import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

const InvoiceFooter = (props) => {
  const {
    styles
  } = props;

  return (
    <div className={css(styles.footer)}>
      InvoiceFooter
    </div>
  );
};

InvoiceFooter.propTypes = {
  styles: PropTypes.object
};

InvoiceFooter.defaultProps = {
  // Define
};

const styleThunk = () => ({
  footer: {
    // Define
  }
});

export default withStyles(styleThunk)(InvoiceFooter);
