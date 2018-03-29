import PropTypes from 'prop-types';
import React from 'react';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';

const EllipsisDecorator = (props) => {
  const {offsetkey} = props;
  return (
    <span data-offset-key={offsetkey}>
      <Ellipsis/>
    </span>
  );
};

EllipsisDecorator.propTypes = {
  offsetkey: PropTypes.string
};

export default EllipsisDecorator;
