import PropTypes from 'prop-types';
import React from 'react';
import Row from 'universal/components/Row/Row';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import {cashay} from 'cashay';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';

const TeamInvite = (props) => {
  const {
    styles,
    varList,
    notificationId
  } = props;
  const [inviterName, teamName] = varList;
  const accept = () => {
    const variables = {notificationId};
    cashay.mutate('acceptInvitation', {variables});
  };
  return (
    <Row>
      <div className={css(styles.icon)}>
        <IconAvatar icon="users" size="medium" />
      </div>
      <div className={css(styles.message)}>
        You have been invited by
        <span className={css(styles.messageVar)}> {inviterName} </span>
        to join
        <span className={css(styles.messageVar)}> {teamName}!</span>
      </div>
      <div className={css(styles.button)}>
        <Button
          colorPalette="cool"
          isBlock
          label="Accept!"
          size={ui.notificationButtonSize}
          type="submit"
          onClick={accept}
        />
      </div>
    </Row>
  );
};

TeamInvite.propTypes = {
  styles: PropTypes.object,
  varList: PropTypes.array.isRequired,
  notificationId: PropTypes.string.isRequired
};

const styleThunk = () => ({
  ...defaultStyles,

  button: {
    marginLeft: ui.rowGutter,
    minWidth: '3.5rem'
  }
});

export default withStyles(styleThunk)(TeamInvite);
