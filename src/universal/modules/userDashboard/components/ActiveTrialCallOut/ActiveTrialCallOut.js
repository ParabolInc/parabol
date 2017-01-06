import React, {PropTypes} from 'react';
import Button from 'universal/components/Button/Button';
import CallOutPanel from 'universal/components/CallOutPanel/CallOutPanel';

const button = (func) =>
  <Button colorPalette="cool" label="Add Billing Information" onClick={func} />;

const ActiveTrialCallOut = (props) =>
  <CallOutPanel control={button(props.onClick)} heading={'Add 30 days to your trial period!'}>
    <span>Add your billing information by <b>January 10, 2017</b>, <br/>extending your trial to <b>February 10, 2017</b>.</span>
  </CallOutPanel>;

ActiveTrialCallOut.propTypes = {
  onClick: PropTypes.func
};

export default ActiveTrialCallOut;
