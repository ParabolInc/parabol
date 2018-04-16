import React from 'react';
import FontAwesome from 'react-fontawesome';

const domProps = [
  'onClick'
];
const propSet = new Set([...Object.keys(FontAwesome.propTypes), ...domProps]);

const StyledFontAwesome = (props) => {
  const goodProps = {};
  Object.keys(props).forEach((propName) => {
    if (propSet.has(propName)) {
      goodProps[propName] = props[propName];
    }
  });
  return <FontAwesome {...goodProps} />;
};

export default StyledFontAwesome;
