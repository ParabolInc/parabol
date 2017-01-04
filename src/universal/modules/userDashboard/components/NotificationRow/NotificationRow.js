import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import notificationPicker from 'universal/modules/userDashboard/NotificationButtons/index';

const NotificationRow = (props) => {
  const {type, styles, varList} = props;

  const {Buttons, makeContent, makeIcon} = notificationPicker[type];

  return (
    <div className={css(styles.row)}>
      {makeIcon()}
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
  row: {
    alignItems: 'center',
    display: 'flex',
    margin: '.5rem'
  },
  message: {
    flex: 1,
    margin: '.5rem'
  },
  buttonGroup: {}
});

export default withStyles(styleThunk)(NotificationRow);

