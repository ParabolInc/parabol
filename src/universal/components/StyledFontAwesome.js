import React from 'react';
import FontAwesome from 'react-fontawesome';

const StyledFontAwesome = (props) => {
  const goodProps = {};
  Object.keys(props).forEach((propName) => {
    if (FontAwesome.propTypes[propName]) {
      goodProps[propName] = props[propName];
    }
  });
  return <FontAwesome {...goodProps} />;
};

export default StyledFontAwesome;
