import PropTypes from 'prop-types';
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';

const style = {
  color: appTheme.palette.cool
};

const EditorLink = (props) => {
  // const {url} = props.contentState.getEntity(props.entityKey).getData();
  const {offsetkey, children} = props;
  return (
    <span data-offset-key={offsetkey} style={style}>
      {children}
    </span>
  );
};

EditorLink.propTypes = {
  children: PropTypes.any,
  offsetkey: PropTypes.string,
  styles: PropTypes.object
};

export default EditorLink;
