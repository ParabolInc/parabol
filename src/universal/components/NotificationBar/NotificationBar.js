import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';
// import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router';

// const faHourglassStyle = {
//   fontSize: '14px',
//   lineHeight: 'inherit',
//   marginRight: '.25rem'
// };
//
// <div className={css(styles.timestamp)}>
//   <FontAwesome
//     name="hourglass-end"
//     style={faHourglassStyle}
//   /> {"12:32"} remaining
// </div>
//
// timestamp: {
// ...inlineBlock,
//     backgroundColor: '#fff',
//     borderRadius: '4rem',
//     color: appTheme.palette.warm,
//     fontSize: appTheme.typography.s2,
//     fontWeight: 700,
//     padding: '0 1em'
// }

const NotificationBar = (props) => {
  const {activeMeetings, styles} = props;
  return (
    <div className={css(styles.bar)}>
      <div className={css(styles.inlineBlock, styles.message)}>
        You’ve got a meeting:
      </div>
      <div className={css(styles.inlineBlock)}>
        {activeMeetings.map(meeting => {
          return (
            <Link key={meeting.link} className={css(styles.link)} title="Join Active Meeting" to={meeting.link}>
              {meeting.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};


NotificationBar.propTypes = {
  activeMeetings: PropTypes.array,
  styles: PropTypes.object
};

const styleThunk = () => ({
  bar: {
    backgroundColor: appTheme.palette.warm,
    color: '#fff',
    fontSize: appTheme.typography.s4,
    lineHeight: '1.375rem',
    padding: '.625rem 1rem',
    textAlign: 'center'
  },

  inlineBlock: {
    display: 'inline-block',
    margin: '0 1rem',
    verticalAlign: 'top'
  },

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
    fontWeight: 700
  }
});

export default withStyles(styleThunk)(NotificationBar);
