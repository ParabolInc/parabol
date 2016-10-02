import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
import {reduxForm} from 'redux-form';

let s = {};

const MeetingAgendaInput = (props) => {
  const {author, onChange, placeholder, value} = props;
  return (
    <div className={s.root}>
      <input
        className={s.input}
        onChange={onChange}
        placeholder={placeholder}
        title="Add a Request"
        type="text"
        value={value}
      />
      <div className={s.author}>{author}</div>
    </div>
  );
};

s = StyleSheet.create({
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

MeetingAgendaInput.propTypes = {
  author: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
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

const reduxFormOptions = {form: 'meetingAgendaInput'};
export default reduxForm(reduxFormOptions)(withStyles(styleThunk)(MeetingAgendaInput));
