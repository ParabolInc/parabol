import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import FontAwesome from 'react-fontawesome';
import {push} from 'react-router-redux';

let styles = {};

const inlineBlock = {
  display: 'inline-block',
  margin: '0 1rem',
  verticalAlign: 'top'
};

const faHourglassStyle = {
  fontSize: '14px',
  lineHeight: 'inherit',
  marginRight: '.25rem'
};

const NotificationBar = (props) => {
  const {
    link,
    linkLabel,
    message,
    timestamp
  } = props.notification;
  const onClick = (event) => {
    event.preventDefault();
    const {dispatch} = props;
    dispatch(push(link));
  };
  return (
    <div className={styles.bar}>
      <div className={styles.timestamp}>
        <FontAwesome
          name="hourglass-end"
          style={faHourglassStyle}
        /> {timestamp} remaining
      </div>
      <div className={styles.message}>
        {message}
      </div>
      <div className={styles.inlineBlock}>
        <a className={styles.link} onClick={onClick} title={linkLabel}>
          {linkLabel}
        </a>
      </div>
    </div>
  );
};

NotificationBar.propTypes = {
  dispatch: PropTypes.func,
  notification: PropTypes.object
};

styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.palette.warm,
    color: '#fff',
    fontSize: theme.typography.s4,
    lineHeight: '1.375rem',
    padding: '.625rem 1rem',
    textAlign: 'center'
  },

  inlineBlock,

  link: {
    color: 'inherit',
    textDecoration: 'underline',

    ':hover': {
      color: 'inherit',
      opacity: '.5'
    },
    ':focus': {
      color: 'inherit',
      opacity: '.5'
    }
  },

  message: {
    ...inlineBlock,
    fontWeight: 700
  },

  timestamp: {
    ...inlineBlock,
    backgroundColor: '#fff',
    borderRadius: '4rem',
    color: theme.palette.warm,
    fontSize: theme.typography.s2,
    fontWeight: 700,
    padding: '0 1em'
  }
});

export default look(NotificationBar);
