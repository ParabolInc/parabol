import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';
import InvoiceRow from 'universal/modules/userDashboard/components/InvoiceRow/InvoiceRow';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import ActiveTrialCallOut from '../ActiveTrialCallOut/ActiveTrialCallOut';
import ExpiredTrialCallOut from '../ExpiredTrialCallOut/ExpiredTrialCallOut';
import CreditCardModal from 'universal/modules/userDashboard/components/CreditCardModal/CreditCardModal';
import appTheme from 'universal/styles/theme/appTheme';

const OrgBilling = (props) => {
  const {
    invoices,
    styles,
    org
  } = props;
  const {creditCard, id: orgId, isTrial, validUntil} = org;
  const {brand = '???', last4 = '••••', expiry = '???'} = creditCard;
  const now = new Date();
  const activeTrial = isTrial && validUntil > now;
  const expiredTrial = isTrial && validUntil < now;
  const update = <Button
    colorPalette="cool"
    label="Update"
    size="small"
  />;
  return (
    <div>
      {activeTrial && <ActiveTrialCallOut validUntil={validUntil} orgId={orgId} />}
      {expiredTrial && <ExpiredTrialCallOut orgId={orgId} />}
      <Panel label="Credit Card Information">
        <div className={css(styles.infoAndUpdate)}>
          <div className={css(styles.creditCardInfo)}>
            <FontAwesome className={css(styles.creditCardIcon)} name="credit-card"/>
            <span className={css(styles.creditCardProvider)}>{brand || '???'}</span>
            <span className={css(styles.creditCardNumber)}>•••• •••• •••• {last4 || '••••'}</span>
            <span className={css(styles.creditCardExpiresLabel)}>Expires</span>
            <span className={css(styles.expiry)}>{expiry || '??/??'}</span>
          </div>
          <CreditCardModal isUpdate orgId={orgId} toggle={update}/>
        </div>
      </Panel>
      <Panel label="Invoices">
        <div className={css(styles.listOfInvoices)}>
          {!isTrial ?
            <div className={css(styles.noInvoices)}>
              No invoices yet! Can’t beet free! Eat some beets! Betaine keeps you healthy!
            </div> :
            invoices.map((invoice, idx) =>
              <InvoiceRow key={`invoiceRow${idx}`} invoice={invoice}/>
            )
          }
        </div>
      </Panel>
    </div>
  );
};

const styleThunk = () => ({
  creditCardInfo: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s3,
    lineHeight: appTheme.typography.s5
  },

  creditCardIcon: {
    marginRight: '1rem'
  },

  creditCardProvider: {
    fontWeight: 700,
    marginRight: '.5rem'
  },

  creditCardNumber: {
    marginRight: '2rem'
  },

  creditCardExpiresLabel: {
    fontWeight: 700,
    marginRight: '.5rem'
  },

  infoAndUpdate: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: `0 ${ui.panelGutter} ${ui.panelGutter}`
  },

  noInvoices: {
    textAlign: 'center',
    margin: '1rem'
  }
});

export default withStyles(styleThunk)(OrgBilling);
