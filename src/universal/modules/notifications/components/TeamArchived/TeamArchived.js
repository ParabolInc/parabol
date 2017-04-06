import React, {PropTypes} from 'react';
import Row from 'universal/components/Row/Row';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import {cashay} from 'cashay';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';

const TeamArchived = (props) => {
  const {
    styles,
    varList,
    notificationId
  } = props;
  const [teamName] = varList;
  const acknowledge = () => {
    const variables = {notificationId};
    cashay.mutate('clearNotification', {variables});
  };
  return (
    <Row>
      <div className={css(styles.icon)}>
        <IconAvatar icon="users" size="medium" />
      </div>
      <div className={css(styles.message)}>
        The team:
        <span className={css(styles.messageVar)}> {teamName} </span>
        was archived
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

TeamArchived.propTypes = {
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

export default withStyles(styleThunk)(TeamArchived);
