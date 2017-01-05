import React, {Component, PropTypes} from 'react';
import {withRouter} from 'react-router';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Button from 'universal/components/Button/Button';
import fromNow from 'universal/utils/fromNow';
import defaultStyles from './styles';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';

const TrialExpiresSoon = (props) => {
  const {router, styles, varList} = props;
  const [expiresAt, orgId] = varList;
  const daysLeft = fromNow(expiresAt);
  const addBilling = () => {
    router.push(`/me/organizations/${orgId}`)
  };
  return (
  <div className={css(styles.row)}>
    <div className={css(styles.icon)}>
      <AvatarPlaceholder/>
    </div>
    <div className={css(styles.message)}>
      You're free trial will expire in <span className={css(styles.messageVar)}>{daysLeft}</span>.
      Want another free month? Just add your billing info
    </div>
    <div className={css(styles.buttonGroup)}>
      <Button
        borderRadius="4px"
        colorPalette="cool"
        isBlock
        label="Add Billing Info"
        size="small"
        type="submit"
        onClick={addBilling}
      />
    </div>
  </div>

  )
};

const styleThunk = () => ({
  ...defaultStyles
});

export default withRouter(
  withStyles(styleThunk)(TrialExpiresSoon)
);



