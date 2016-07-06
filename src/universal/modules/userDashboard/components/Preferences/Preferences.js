import React, {PropTypes} from 'react';

import DashContent from 'universal/components/DashContent/DashContent';
import DashHeader from 'universal/components/DashHeader/DashHeader';

const Preferences = (props) => {
  return (
    <div>
      <DashHeader title="My Preferences" />
      <DashContent>
        Hey, how about some preferences here?
      </DashContent>
    </div>
  );
};

Preferences.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    nickname: PropTypes.string,
  })
};

export default Preferences;
