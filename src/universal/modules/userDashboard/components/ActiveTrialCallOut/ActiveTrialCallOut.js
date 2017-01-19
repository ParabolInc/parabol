import React, {PropTypes} from 'react';
import Button from 'universal/components/Button/Button';
import CallOutPanel from 'universal/components/CallOutPanel/CallOutPanel';
import ms from 'ms';
import makeDateString from 'universal/utils/makeDateString';

const button = (func) =>
  <Button colorPalette="cool" label="Add Billing Information" onClick={func}/>;

const ActiveTrialCallOut = (props) => {
  const {validUntil} = props;
  const trialEnd = makeDateString(validUntil, false);
  const newTrialEnd = makeDateString(new Date(validUntil.getTime() + ms('30d')), false);
  return (
    <CallOutPanel control={button(props.onClick)} heading={'Add a free 30 days to your trial period!'}>
      <span>Add your billing information by <b>{trialEnd}</b>, <br/>to extend your trial to <b>{newTrialEnd}</b>.</span>
    </CallOutPanel>
  );
}

ActiveTrialCallOut.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default ActiveTrialCallOut;
