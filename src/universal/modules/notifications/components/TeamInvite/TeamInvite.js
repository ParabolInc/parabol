import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import AcceptTeamInviteMutation from 'universal/mutations/AcceptTeamInviteMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const TeamInvite = (props) => {
  const {
    atmosphere,
    styles,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props;
  const {id, inviterName, teamName} = notification;
  const accept = () => {
    const {id: dbNotificationId} = fromGlobalId(id);
    submitMutation();
    AcceptTeamInviteMutation(atmosphere, dbNotificationId, onError, onCompleted);
  };

  return (
    <Row compact>
      <div className={css(styles.icon)}>
        <IconAvatar icon="users" size="small" />
      </div>
      <div className={css(styles.message)}>
        {'You have been invited by '}
        <b>{inviterName}</b>
        {' to join '}
        <b>{teamName}</b>
        {'.'}
      </div>
      <div className={css(styles.button)}>
        <Button
          aria-label="Accept"
          buttonSize={ui.notificationButtonSize}
          colorPalette="cool"
          isBlock
          label="Accept"
          onClick={accept}
          type="submit"
          waiting={submitting}
        />
      </div>
    </Row>
  );
};

TeamInvite.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    inviterName: PropTypes.string.isRequired,
    teamName: PropTypes.string.isRequired
  })
};

const styleThunk = () => ({
  ...defaultStyles
});

export default withStyles(styleThunk)(TeamInvite);
