import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

let s = {};

const PlaceholderInput = (props) => {
  const {author, onChange, placeholder, value} = props;
  return (
    <div className={s.root}>
      <input
        className={s.input}
        onChange={onChange}
        placeholder={placeholder}
        title="Placeholder input"
        type="text"
        value={value}
      />
      <div className={s.author}>{author}</div>
    </div>
  );
};

s = StyleSheet.create({
  root: {
    backgroundColor: 'transparent',
    color: theme.palette.cool,
    fontSize: theme.typography.s3,
    padding: '.5rem .75rem .5rem 4rem',
    position: 'relative',
    width: '100%',

    ':hover': {
      backgroundColor: theme.palette.light
    },
    ':focus': {
      backgroundColor: theme.palette.light
    }
  },

  input: {
    backgroundColor: 'transparent',
    border: 0,
    boxShadow: 'none',
    display: 'block',
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s3,
    fontStyle: 'italic',
    fontWeight: 700,
    margin: 0,
    outline: 'none',
    padding: 0,
    width: '100%'
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

PlaceholderInput.propTypes = {
  author: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string
};

PlaceholderInput.defaultProps = {
  author: 'MK',
  onChange() {
    console.log('PlaceholderInput onChange');
  },
  placeholder: 'kittens (press enter)',
  value: ''
};

export default look(PlaceholderInput);
