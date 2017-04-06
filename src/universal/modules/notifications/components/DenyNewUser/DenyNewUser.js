import React, {PropTypes} from 'react';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import Row from 'universal/components/Row/Row';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import {cashay} from 'cashay';

const TrialExpiresSoon = (props) => {
  const {
    notificationId,
    styles,
    varList
  } = props;
  const [reason, billingLeaderName, inviteeEmail] = varList;
  const safeReason = reason || 'none given';
  const acknowledge = () => {
    const variables = {notificationId};
    cashay.mutate('clearNotification', {variables});
  };
  return (
    <Row>
      <div className={css(styles.icon)}>
        <IconAvatar icon="user" size="medium" />
      </div>
      <div className={css(styles.message)}>
        <span className={css(styles.messageVar)}>{billingLeaderName} </span>
        has denied
        <span className={css(styles.messageVar)}> {inviteeEmail} </span>
        from joining the organization. <br />
        <b>Reason</b>: “{safeReason}”
      </div>
      <div className={css(styles.button)}>
        <Button
          colorPalette="cool"
          isBlock
          label="Okay"
          size={ui.notificationButtonSize}
          type="submit"
          onClick={acknowledge}
        />
      </div>
    </Row>
  );
};

TrialExpiresSoon.propTypes = {
  notificationId: PropTypes.string,
  styles: PropTypes.object,
  varList: PropTypes.array
};

const styleThunk = () => ({
  ...defaultStyles,

  button: {
    marginLeft: ui.rowGutter,
    minWidth: '3.5rem'
  }
});

export default withStyles(styleThunk)(TrialExpiresSoon);
