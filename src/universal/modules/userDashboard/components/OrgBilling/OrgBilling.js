import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';
import InvoiceRow from 'universal/modules/userDashboard/components/InvoiceRow/InvoiceRow';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import {togglePaymentModal} from 'universal/modules/userDashboard/ducks/orgSettingsDuck';
import ActiveTrialCallOut from '../ActiveTrialCallOut/ActiveTrialCallOut';
import ExpiredTrialCallOut from '../ExpiredTrialCallOut/ExpiredTrialCallOut';

const OrgBilling = (props) => {
  const {
    invoices,
    dispatch,
    styles,
    org
  } = props;
  const {creditCard, isTrial, validUntil} = org;
  const {brand, last4, expiry} = creditCard;
  const openPaymentModal = () => {
    dispatch(togglePaymentModal());
  };
  const now = new Date();
  const activeTrial = isTrial && validUntil > now;
  const expiredTrial = isTrial && validUntil < now;
  return (
    <div>
      {activeTrial && <ActiveTrialCallOut validUntil={validUntil} onClick={openPaymentModal} />}
      {expiredTrial && <ExpiredTrialCallOut onClick={openPaymentModal} />}
      <Panel label="Credit Card Information">
        <div className={css(styles.infoAndUpdate)}>
          <div className={css(styles.creditCardInfo)}>
            <FontAwesome name="credit-card"/>
            <span className={css(styles.creditCardProvider)}>{brand}</span>
            <span className={css(styles.creditCardNumber)}>•••• •••• •••• {last4}</span>
          </div>
          <Button
            colorPalette="cool"
            label="Update"
            onClick={openPaymentModal}
            size="small"
          />
        </div>
      </Panel>
      <Panel label="Invoices">
        <div className={css(styles.listOfInvoices)}>
          {!isTrial ?
            <div className={css(styles.noInvoices)}>
              No invoices yet! Can’t beet free! Eat some beets! Betaine keeps you healthy!
            </div> :
            invoices.map((invoice) =>
              <InvoiceRow invoice={invoice}/>
            )
          }
        </div>
      </Panel>
    </div>
  );
};

const styleThunk = () => ({
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
