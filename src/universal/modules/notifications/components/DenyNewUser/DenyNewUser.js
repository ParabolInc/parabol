import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import {clearNotificationLabel} from '../../helpers/constants';

const DenyNewUser = (props) => {
  const {
    atmosphere,
    styles,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props;
  const {id, reason, deniedByName, inviteeEmail} = notification;
  const acknowledge = () => {
    const {id: dbNotificationId} = fromGlobalId(id);
    submitMutation();
    ClearNotificationMutation(atmosphere, dbNotificationId, onError, onCompleted);
  };
  const safeReason = reason || 'none given';
  return (
    <Row compact>
      <div className={css(styles.icon)}>
        <IconAvatar icon="user-circle-o" size="small" />
      </div>
      <div className={css(styles.message)}>
        <b>{deniedByName}</b>
        {' has denied '}
        <b>{inviteeEmail}</b>
        {' from joining the organization.'}<br />
        <b><i>{'Reason'}</i></b>{': “'}<i>{safeReason}</i>{'”'}
      </div>
      <div className={css(styles.iconButton)}>
        <Button
          aria-label={clearNotificationLabel}
          buttonSize="small"
          colorPalette="gray"
          icon="check"
          isBlock
          onClick={acknowledge}
          waiting={submitting}
        />
      </div>
    </Row>
  );
};

DenyNewUser.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    deniedByName: PropTypes.string.isRequired,
    inviteeEmail: PropTypes.string.isRequired,
    reason: PropTypes.string.isRequired
  })
};

const styleThunk = () => ({
  ...defaultStyles,

  button: {
    marginLeft: ui.rowGutter,
    minWidth: '3.5rem'
  }
});

export default withStyles(styleThunk)(DenyNewUser);
