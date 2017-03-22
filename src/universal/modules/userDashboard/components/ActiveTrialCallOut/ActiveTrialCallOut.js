import React, {PropTypes} from 'react';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import CallOutPanel from 'universal/components/CallOutPanel/CallOutPanel';
import ms from 'ms';
import makeDateString from 'universal/utils/makeDateString';
import CreditCardModalContainer from 'universal/modules/userDashboard/containers/CreditCardModal/CreditCardModalContainer';

const ActiveTrialCallOut = (props) => {
  const {orgId, periodEnd} = props;
  const trialEnd = makeDateString(periodEnd, false);
  const newTrialEnd = makeDateString(new Date(periodEnd.getTime() + ms('30d')), false);
  const button = <Button colorPalette="cool" label="Add Billing Information" size={ui.ctaPanelButtonSize} />;
  const control = <CreditCardModalContainer orgId={orgId} toggle={button} />;
  return (
    <CallOutPanel control={control} heading={'Add a free 30 days to your trial period!'}>
      <span>Add your billing information by <b>{trialEnd}</b>, <br />to extend your trial to <b>{newTrialEnd}</b>.</span>
    </CallOutPanel>
  );
};

ActiveTrialCallOut.propTypes = {
  orgId: PropTypes.string.isRequired,
  periodEnd: PropTypes.object.isRequired
};

export default ActiveTrialCallOut;
