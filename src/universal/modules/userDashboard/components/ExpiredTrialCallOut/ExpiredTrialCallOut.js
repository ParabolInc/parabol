import React, {PropTypes} from 'react';
import Button from 'universal/components/Button/Button';
import CallOutPanel from 'universal/components/CallOutPanel/CallOutPanel';

const button = (func) =>
  <Button colorPalette="cool" label="Add Billing Information" onClick={func} />;

const ExpiredTrialCallOut = (props) =>
  <CallOutPanel control={button(props.onClick)} heading={'Your trial expired!'}>
    <span>Your 30-day trial expired on <b>December 10, 2016</b>. Add your <br />credit card to continue using Action with your teams.</span>
  </CallOutPanel>;

ExpiredTrialCallOut.propTypes = {
  onClick: PropTypes.func
};

export default ExpiredTrialCallOut;
