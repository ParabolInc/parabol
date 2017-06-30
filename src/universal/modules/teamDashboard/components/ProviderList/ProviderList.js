import PropTypes from 'prop-types';
import React from 'react';

const ProviderList = (props) => {
  return (
    <div>
      {providers.map((provider) => {
        return <ProviderRow provider={provider} />
      })}
    </div>
  );
};

ProviderList.propTypes = {
  providers: PropTypes.array.isRequired
};

export default ProviderList;
