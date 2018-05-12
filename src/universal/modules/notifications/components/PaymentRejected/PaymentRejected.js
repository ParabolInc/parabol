import {css} from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ui from 'universal/styles/ui';
import Row from 'universal/components/Row/Row';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Button from 'universal/components/Button/Button';

const PaymentRejected = (props) => {
  const {history, notification} = props;
  const {
    organization: {
      orgId,
      creditCard: {last4, brand}
    }
  } = notification;
  const addBilling = () => {
    history.push(`/me/organizations/${orgId}`);
  };
  return (
    <Row compact>
      <div className={css(defaultStyles.icon)}>
        <IconAvatar icon="credit-card" size="small" />
      </div>
      <div className={css(defaultStyles.message)}>
        {'Your '}
        <b>{brand}</b>
        {' card ending in '}
        <b>{last4}</b>
        {' was rejected.'}
        <br />
        {'Call your card provider or head to the settings page to try a new card.'}
      </div>
      <div className={css(defaultStyles.widestButton)}>
        <Button
          aria-label="Go to the billing page to update billing information"
          buttonSize={ui.notificationButtonSize}
          colorPalette="warm"
          isBlock
          label="See Billing"
          type="submit"
          onClick={addBilling}
        />
      </div>
    </Row>
  );
};

PaymentRejected.propTypes = {
  history: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired
};

export default createFragmentContainer(
  withRouter(PaymentRejected),
  graphql`
    fragment PaymentRejected_notification on NotifyPaymentRejected {
      notificationId: id
      organization {
        orgId: id
        creditCard {
          last4
          brand
        }
      }
    }
  `
);
