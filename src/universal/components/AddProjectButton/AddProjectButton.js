import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import FontAwesome from 'react-fontawesome';

const AddProjectButton = (props) => {
  const {styles, toggleLabel, toggleClickHandler} = props;
  // TODO remove addIcon className?
  return (
    <FontAwesome
      className={css(styles.addIcon, styles[status])}
      name="plus-square-o"
      onClick={toggleClickHandler}
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
  ...projectStatusStyles('color'),
});

export default withStyles(styleThunk)(AddProjectButton);

