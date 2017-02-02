import React, {PropTypes} from 'react';
import Button from 'universal/components/Button/Button';
import CallOutPanel from 'universal/components/CallOutPanel/CallOutPanel';
import ms from 'ms';
import makeDateString from 'universal/utils/makeDateString';
import CreditCardModal from 'universal/modules/userDashboard/components/CreditCardModal/CreditCardModal';

const ActiveTrialCallOut = (props) => {
  const {orgId, validUntil} = props;
  const trialEnd = makeDateString(validUntil, false);
  const newTrialEnd = makeDateString(new Date(validUntil.getTime() + ms('30d')), false);
  const button = <Button colorPalette="cool" label="Add Billing Information"/>;
  const control = <CreditCardModal orgId={orgId} toggle={button}/>;
  return (
    <CallOutPanel control={control} heading={'Add a free 30 days to your trial period!'}>
      <span>Add your billing information by <b>{trialEnd}</b>, <br/>to extend your trial to <b>{newTrialEnd}</b>.</span>
    </CallOutPanel>
  );
}

ActiveTrialCallOut.propTypes = {
  orgId: PropTypes.string.isRequired
};

export default ActiveTrialCallOut;
