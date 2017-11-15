import PropTypes from 'prop-types';
import React from 'react';
import appTheme from 'universal/styles/theme/appTheme';

const style = {
  backgroundColor: appTheme.palette.cool20l,
  color: appTheme.palette.cool,
  fontWeight: 700
};

const Mention = (props) => {
  // const {url} = props.contentState.getEntity(props.entityKey).getData();
  const {offsetkey, children} = props;
  return (
    <span data-offset-key={offsetkey} style={style}>
      {children}
    </span>
  );
};

Mention.propTypes = {
  children: PropTypes.any,
  offsetkey: PropTypes.string
};

export default Mention;
