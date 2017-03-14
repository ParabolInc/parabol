import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import lockup from 'universal/styles/theme/images/brand/parabol-lockup-v-dark.svg';

const InvoiceFooter = (props) => {
  const {
    styles
  } = props;

  return (
    <div className={css(styles.footer)}>
      <div className={css(styles.heading)}>
        {'Thank you for using Action!'}
      </div>
      <div className={css(styles.copy)}>
        {'Questions? Concerns?'}<br />
        {'Get in touch: '}<a href="mailto:billing@parabol.co" title="Contact Us"><b>{'billing@parabol.co'}</b></a>
      </div>
      <img alt="Logo for Parabol" className={css(styles.lockup)} src={lockup} />
      <div className={css(styles.finePrint)}>
        {'Parabol, Inc.'}<br />
        {'68 3rd Street'}<br />
        {'Brooklyn, NY, 11231'}<br />
        {'United States'}<br />
        <a href="tel:6122275673" title="Call us: 612-227-5673">{'612-227-5673'}</a><br />
        <a href="mailto:love@parabol.co" title="Email us:love@parabol.co">{'love@parabol.co'}</a>
      </div>
    </div>
  );
};

InvoiceFooter.propTypes = {
  styles: PropTypes.object
};

const styleThunk = () => ({
  footer: {
    textAlign: 'center'
  },

  heading: {
    fontSize: appTheme.typography.s5,
    fontWeight: 700,
    lineHeight: '1.5'
  },

  copy: {
    fontSize: appTheme.typography.s3,
    lineHeight: appTheme.typography.s5,
  },

  lockup: {
    display: 'block',
    margin: '1.5rem auto 0',
    opacity: '.5'
  },

  finePrint: {
    fontSize: appTheme.typography.s1,
    lineHeight: '1.5',
    margin: '1rem auto 0',
  }
});

export default withStyles(styleThunk)(InvoiceFooter);
