import PropTypes from 'prop-types';
import React from 'react';
import {withRouter} from 'react-router-dom';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Button from 'universal/components/Button/Button';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import Row from 'universal/components/Row/Row';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const PaymentRejected = (props) => {
  const {history, styles, notification} = props;
  const {last4, brand, orgId} = notification;
  const addBilling = () => {
    history.push(`/me/organizations/${orgId}`);
  };
  return (
    <Row>
      <div className={css(styles.icon)}>
        <div className={css(styles.avatarPlaceholder)}>
          <div className={css(styles.avatarPlaceholderInner)}>
            <FontAwesome name="credit-card" />
          </div>
        </div>
      </div>
      <div className={css(styles.message)}>
        Your <span className={css(styles.messageVar)}> {brand} </span> card ending in
        <span className={css(styles.messageVar)}> {last4} </span> was rejected.
        Call your card provider or head to the settings page to try a new card.
      </div>
      <div className={css(styles.buttonGroup)}>
        <Button
          colorPalette="cool"
          isBlock
          label="Take me there"
          buttonSize={ui.notificationButtonSize}
          type="submit"
          onClick={addBilling}
        />
      </div>
    </Row>
  );
};

PaymentRejected.propTypes = {
  history: PropTypes.object.isRequired,
  styles: PropTypes.object,
  notification: PropTypes.shape({
    brand: PropTypes.string.isRequired,
    last4: PropTypes.string.isRequired,
    orgId: PropTypes.string.isRequired
  })
};

const avatarPlaceholderSize = '2.75rem';
const styleThunk = () => ({
  ...defaultStyles,
  avatarPlaceholder: {
    backgroundColor: appTheme.palette.mid50l,
    borderRadius: '100%',
    // boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${appTheme.palette.mid10a}`,
    color: appTheme.palette.mid50l,
    fontSize: ui.iconSizeAvatar,
    height: avatarPlaceholderSize,
    lineHeight: avatarPlaceholderSize,
    padding: '1px',
    position: 'relative',
    textAlign: 'center',
    width: avatarPlaceholderSize,

    ':after': {
      border: '2px solid currentColor',
      borderRadius: '100%',
      content: '""',
      display: 'block',
      height: avatarPlaceholderSize,
      left: 0,
      position: 'absolute',
      top: 0,
      width: avatarPlaceholderSize
    }
  },

  avatarPlaceholderInner: {
    backgroundColor: '#fff',
    borderRadius: '100%',
    height: '2.625rem',
    // lineHeight: '2.625rem',
    overflow: 'hidden',
    width: '2.625rem'
  }
});

export default withRouter(
  withStyles(styleThunk)(PaymentRejected)
);
