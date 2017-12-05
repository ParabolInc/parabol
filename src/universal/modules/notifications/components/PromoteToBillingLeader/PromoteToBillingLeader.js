import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const PromoteToBillingLeader = (props) => {
  const {
    atmosphere,
    history,
    styles,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props;
  const {id: notificationId, groupName: orgName, orgId} = notification;
  const acknowledge = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
    history.push(`/me/organizations/${orgId}`);
  };

  return (
    <Row>
      <div className={css(styles.icon)}>
        <IconAvatar icon="user" size="medium" />
      </div>
      <div className={css(styles.message)}>
        You are now a Billing Leader for
        <span className={css(styles.messageVar)}> {orgName}</span>
      </div>
      <div className={css(styles.button)}>
        <Button
          colorPalette="cool"
          isBlock
          label="Take me there"
          buttonSize={ui.notificationButtonSize}
          type="submit"
          onClick={acknowledge}
          waiting={submitting}
        />
      </div>
    </Row>
  );
};

PromoteToBillingLeader.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    groupName: PropTypes.string.isRequired,
    orgId: PropTypes.string.isRequired
  })
};

const styleThunk = () => ({
  ...defaultStyles,

  button: {
    marginLeft: ui.rowGutter,
    minWidth: '3.5rem'
  }
});

export default withRouter(withStyles(styleThunk)(PromoteToBillingLeader));
