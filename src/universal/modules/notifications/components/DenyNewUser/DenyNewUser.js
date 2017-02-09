import React, {Component, PropTypes} from 'react';
import {withRouter} from 'react-router';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Button from 'universal/components/Button/Button';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {cashay} from 'cashay';

const TrialExpiresSoon = (props) => {
  const {notificationId, styles, varList} = props;
  const [reason, billingLeaderName, inviteeEmail] = varList;
  const safeReason = reason || 'none given';
  const acknowledge = () => {
    const variables = {notificationId};
    cashay.mutate('clearNotification', {variables});
  };
  return (
    <div className={css(styles.row)}>
      <div className={css(styles.icon)}>
        <AvatarPlaceholder/>
      </div>
      <div className={css(styles.message)}>
        {billingLeaderName} has denied {inviteeEmail} from joining the organization.
        Reason: {safeReason}
      </div>
      <div className={css(styles.buttonGroup)}>
        <Button
          colorPalette="cool"
          isBlock
          label="OK"
          size="small"
          type="submit"
          onClick={acknowledge}
        />
      </div>
    </div>
  );
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

export default withStyles(styleThunk)(TrialExpiresSoon);
