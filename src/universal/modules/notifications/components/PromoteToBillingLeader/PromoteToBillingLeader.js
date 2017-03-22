import React, {PropTypes} from 'react';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import Row from 'universal/components/Row/Row';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import {cashay} from 'cashay';
import {withRouter} from 'react-router';

const PromoteToBillingLeader = (props) => {
  const {
    notificationId,
    orgId,
    router,
    styles,
    varList
  } = props;
  const [orgName] = varList;
  const acknowledge = () => {
    const variables = {notificationId};
    cashay.mutate('clearNotification', {variables});
    router.push(`/me/organizations/${orgId}`);
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
          size={ui.notificationButtonSize}
          type="submit"
          onClick={acknowledge}
        />
      </div>
    </Row>
  );
};

PromoteToBillingLeader.propTypes = {
  notificationId: PropTypes.string.isRequired,
  orgId: PropTypes.string.isRequired,
  router: PropTypes.object.isRequired,
  styles: PropTypes.object,
  varList: PropTypes.array.isRequired
};

const styleThunk = () => ({
  ...defaultStyles,

  button: {
    marginLeft: ui.rowGutter,
    minWidth: '3.5rem'
  }
});

export default withRouter(withStyles(styleThunk)(PromoteToBillingLeader));
