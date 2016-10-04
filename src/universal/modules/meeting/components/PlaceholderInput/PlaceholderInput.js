import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {reduxForm} from 'redux-form';

const MeetingAgendaInput = (props) => {
  const {author, onChange, placeholder, styles, value} = props;
  return (
    <div className={css(styles.root)}>
      <input
        className={css(styles.input)}
        onChange={onChange}
        placeholder={placeholder}
        title="Add a Request"
        type="text"
        value={value}
      />
      <div className={css(styles.author)}>{author}</div>
    </div>
  );
};

MeetingAgendaInput.propTypes = {
  author: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  styles: PropTypes.object,
  value: PropTypes.string
};

MeetingAgendaInput.defaultProps = {
  author: 'MK',
  onChange() {
    console.log('MeetingAgendaInput onChange');
  },
  placeholder: 'kittens (press enter)',
  value: ''
};

const styleThunk = () => ({
  root: {
    backgroundColor: appTheme.palette.light,
    color: appTheme.palette.cool,
    fontSize: appTheme.typography.s3,
    padding: '.5rem .75rem .5rem 4rem',
    position: 'relative',
    width: '100%',
  },

  input: {
    backgroundColor: 'transparent',
    border: 0,
    boxShadow: 'none',
    color: appTheme.palette.dark10d,
    display: 'block',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    margin: 0,
    outline: 'none',
    padding: 0,
    width: '100%',

    '::placeholder': {
      color: appTheme.palette.dark50l
    },
  },

  author: {
    display: 'none', // TODO: Show on focus/active
    fontWeight: 700,
    right: '.75rem',
    lineHeight: `${34 / 16}rem`,
    paddingTop: '1px',
    position: 'absolute',
    textAlign: 'right',
    top: 0
  }
});

const reduxFormOptions = {form: 'meetingAgendaInput'};
export default reduxForm(reduxFormOptions)(withStyles(styleThunk)(MeetingAgendaInput));
