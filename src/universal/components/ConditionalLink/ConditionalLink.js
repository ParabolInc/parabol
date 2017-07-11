import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router-dom';

const ConditionalLink = (props) => {
  const {
    isLink,
    replace,
    to,
    ...elementProps
  } = props;
  return isLink ? <Link {...elementProps} to={to} replace={replace}/> : <div {...elementProps}/>
};


ConditionalLink.propTypes = {
  isLink: PropTypes.bool.isRequired,
  replace: PropTypes.bool,
  to: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired
};

export default ConditionalLink;