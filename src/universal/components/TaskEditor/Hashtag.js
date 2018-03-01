import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';

// inline styles so oy-vey doesn't barf when making emails using draft-js cards
const style = {
  // color: appTheme.palette.warm, // TODO: theme-able?
  color: ui.colorText, // TODO: theme-able?
  fontWeight: 600
};

const Hashtag = (props) => {
  // const {url} = props.contentState.getEntity(props.entityKey).getData();
  const {offsetkey, children} = props;
  return (
    <span data-offset-key={offsetkey} style={style}>
      {children}
    </span>
  );
};

Hashtag.propTypes = {
  children: PropTypes.any,
  offsetkey: PropTypes.string,
  styles: PropTypes.object
};

export default Hashtag;
