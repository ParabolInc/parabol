import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import ui from 'universal/styles/ui';

const AddProjectButton = (props) => {
  const {styles, toggleLabel, toggleClickHandler} = props;
  const iconStyle = {
    fontSize: ui.iconSize2x,
    height: '1.5rem',
    lineHeight: '1.5rem',
    paddingTop: '1px'
  };
  return (
    <FontAwesome
      className={css(styles.addIcon)}
      name="plus-square-o"
      onClick={toggleClickHandler}
      style={iconStyle}
      title={`Add a Project set to ${toggleLabel}`}
    />
  );
};

AddProjectButton.propTypes = {
  styles: PropTypes.object,
  toggleLabel: PropTypes.string,
  toggleClickHandler: PropTypes.func
};

const styleThunk = () => ({
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

export default withStyles(styleThunk)(AddProjectButton);
