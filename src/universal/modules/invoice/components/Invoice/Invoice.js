import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import InvoiceHeader from '../InvoiceHeader/InvoiceHeader';
import InvoiceFooter from '../InvoiceFooter/InvoiceFooter';
import InvoiceLineItemContainer from '../../containers/InvoiceLineItemContainer/InvoiceLineItemContainer';

const demoItemsNextMonth = [
  {
    desc: '7 active users ($5 each)',
    amount: '$35.00',
    details: null
  }
];

const demoItemsLastMonth = [
  {
    desc: '3 new users added',
    amount: '$10.05',
    details: [
      {
        desc: 'matt@sample.co joined Dec 14, 2016',
        amount: '$3.35'
      },
      {
        desc: 'taya@sample.co joined Dec 14, 2016',
        amount: '$3.35'
      },
      {
        desc: 'terry@sample.co joined Dec 14, 2016',
        amount: '$3.35'
      }
    ]
  },
  {
    desc: 'Adjustments for paused users',
    amount: '-$1.83',
    details: [
      {
        desc: 'amal@sample.co paused Dec 14, 2016–Dec 28, 2016',
        amount: '-$2.50'
      },
      {
        desc: 'marimar@sample.co unpaused 2016–Jan 2, 2017',
        amount: '$0.67'
      }
    ]
  }
];

const Invoice = (props) => {
  const {
    styles
  } = props;

  const makeLineItems = (arr) =>
    arr.map((li, idx) => <InvoiceLineItemContainer key={idx} item={li}/>);

  return (
    <div className={css(styles.invoice)}>
      <InvoiceHeader/>
      <div className={css(styles.panel)}>
        <div className={css(styles.label)}>{'Invoice'}</div>
        <div className={css(styles.heading)}>{'February 2017'}</div>

        <div className={css(styles.sectionHeader)}>
          <div className={css(styles.subHeading)}>{'Next month’s usage'}</div>
          <div className={css(styles.meta)}>{'Jan 7, 2017 to Feb 6, 2017'}</div>
        </div>

        {makeLineItems(demoItemsNextMonth)}

        <div className={css(styles.sectionHeader)}>
          <div className={css(styles.subHeading)}>{'Last month’s adjustments (prorated)'}</div>
          <div className={css(styles.meta)}>{'Dec 7, 2017 to Jan 6, 2017'}</div>
        </div>

        {makeLineItems(demoItemsLastMonth)}

        <div className={css(styles.total)}>
          <div>{'Total'}</div>
          <div>{'$43.22'}</div>
        </div>
        <div className={css(styles.meta)}>
          Charged to <b>Visa</b> ending in <b>3245</b>
        </div>
      </div>
      <InvoiceFooter/>
    </div>
  );
};

Invoice.propTypes = {
  styles: PropTypes.object
};

Invoice.defaultProps = {
  // Define
};

const panelGutter = '1.25rem';
const invoiceGutter = '2rem';

const styleThunk = () => ({
  invoice: {
    backgroundColor: ui.backgroundColor,
    boxShadow: '0 .125rem .25rem 0 rgba(0, 0, 0, .5)',
    color: appTheme.palette.dark,
    margin: '2rem auto',
    maxWidth: '32rem',
    padding: invoiceGutter
  },

  panel: {
    backgroundColor: '#fff',
    border: `1px solid ${ui.invoiceBorderColor}`,
    borderRadius: ui.borderRadiusLarge,
    margin: `${invoiceGutter} 0`,
    padding: `${panelGutter} 0 ${panelGutter} ${panelGutter}`
  },

  label: {
    color: appTheme.palette.dark50l,
    fontSize: appTheme.typography.s3,
    fontWeight: 700,
    textTransform: 'uppercase'
  },

  heading: {
    fontSize: appTheme.typography.s7
  },

  sectionHeader: {
    borderBottom: `1px solid ${ui.invoiceBorderColorLighter}`,
    marginTop: panelGutter,
    paddingBottom: '.75rem'
  },

  subHeading: {
    fontSize: appTheme.typography.s5,
    fontWeight: 700
  },

  meta: {
    fontSize: appTheme.typography.s3
  },

  total: {
    ...ui.invoiceItemBaseStyles,
    fontSize: appTheme.typography.s6,
    fontWeight: 700,
    lineHeight: appTheme.typography.s7,
    marginTop: panelGutter
  }
});

export default withStyles(styleThunk)(Invoice);
