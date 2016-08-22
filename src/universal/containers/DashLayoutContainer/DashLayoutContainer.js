import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {resolveActiveMeetings} from 'universal/subscriptions/computedSubs';
import {cashay} from 'cashay';
import DashLayout from 'universal/components/Dashboard/DashLayout';

const mapStateToProps = (state) => {
  return {
    activeMeetings: cashay.computed('teamSubs', [state.auth.obj.tms], resolveActiveMeetings)
  };
};

const DashLayoutContainer = (props) => {
  const {activeMeetings, children, title} = props;
  return (
    <DashLayout activeMeetings={activeMeetings} children={children} title={title}/>
  );
};

DashLayoutContainer.propTypes = {
  activeMeetings: PropTypes.array,
  children: PropTypes.any,
  title: PropTypes.string
};

export default connect(mapStateToProps)(DashLayoutContainer);
