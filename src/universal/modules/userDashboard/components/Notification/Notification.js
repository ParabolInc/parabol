import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import notificationPicker from 'universal/modules/userDashboard/NotificationButtons/index';

const Notification = (props) => {
  const {type, styles, varList} = props;
  const {Buttons, makeContent} = notificationPicker[type];

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.message)}>
        {makeContent(varList)}
      </div>
      <div className={css(styles.buttonGroup)}>
        <Buttons varList={varList}/>
      </div>
    </div>
  )
};

const styleThunk = () => ({
  root: {},
  message: {},
  buttonGroup: {}
});

export default withStyles(styleThunk)(Notification);

