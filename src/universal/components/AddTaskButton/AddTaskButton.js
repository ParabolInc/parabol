import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';

const iconStyle = {
  display: 'block',
  fontSize: ui.iconSize,
  height: '1.5rem',
  lineHeight: '1.5rem',
  textAlign: 'center',
  width: '1.5rem'
};

const AddTaskButton = (props) => {
  const {styles, label, onClick} = props;
  return (
    <div className={css(styles.addRoot)} onClick={onClick}>
      <FontAwesome
        className={css(styles.addIcon)}
        name="plus"
        style={iconStyle}
        title={`Add a Task set to ${label}`}
      />
    </div>
  );
};

AddTaskButton.propTypes = {
  styles: PropTypes.object,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

const styleThunk = () => ({
  addRoot: {
    backgroundColor: ui.palette.white,
    borderRadius: '100%',
    height: '1.5rem',
    lineHeight: '1.5rem',
    marginRight: '.625rem',
    width: '1.5rem'
  },

  addIcon: {
    ':hover': {
      cursor: 'pointer',
      opacity: '.5'
    },
    ':focus': {
      cursor: 'pointer',
      opacity: '.5'
    }
  }
});

export default withStyles(styleThunk)(AddTaskButton);
