import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
// import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router';

let styles = {};

const inlineBlock = {
  display: 'inline-block',
  margin: '0 1rem',
  verticalAlign: 'top'
};

// const faHourglassStyle = {
//   fontSize: '14px',
//   lineHeight: 'inherit',
//   marginRight: '.25rem'
// };
//
// <div className={styles.timestamp}>
//   <FontAwesome
//     name="hourglass-end"
//     style={faHourglassStyle}
//   /> {"12:32"} remaining
// </div>

const NotificationBar = (props) => {
  const {activeMeetings} = props;
  return (
    <div className={styles.bar}>
      <div className={styles.message}>
        {'You\'ve got meeting:'}
      </div>
      <div className={styles.inlineBlock}>
        {activeMeetings.map(meeting => {
          return (
            <Link key={meeting.link} className={styles.link} title="Join Active Meeting" to={meeting.link}>
              {meeting.name}
            </Link>
          );
        })}

      </div>
    </div>
  );
};


NotificationBar.propTypes = {
  activeMeetings: PropTypes.arrayOf({
    link: PropTypes.string,
    name: PropTypes.string
  })
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

