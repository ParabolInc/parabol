import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import Row from 'universal/components/Row/Row';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const TrialExpired = (props) => {
  const {atmosphere, notification, history, styles} = props;
  const addBilling = () => {
    const {orgId} = notification;
    SendClientSegmentEventMutation(atmosphere, 'Notification TrialExpired Click', {orgId});
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
        Your trial has expired!
        Keep your team going by heading to the Organizastion Settings page.
      </div>
      <div className={css(styles.buttonGroup)}>
        <Button
          colorPalette="cool"
          isBlock
          label="Take me there"
          size={ui.notificationButtonSize}
          type="submit"
          onClick={addBilling}
        />
      </div>
    </Row>
  );
};

TrialExpired.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  notification: PropTypes.shape({
    orgId: PropTypes.string.isRequired
  }),
  history: PropTypes.object.isRequired,
  styles: PropTypes.string
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

export default
withRouter(
  withStyles(styleThunk)(TrialExpired)
);
