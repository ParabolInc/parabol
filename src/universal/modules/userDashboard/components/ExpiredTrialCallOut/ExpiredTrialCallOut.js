import React, {PropTypes} from 'react';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import CallOutPanel from 'universal/components/CallOutPanel/CallOutPanel';
import makeDateString from 'universal/utils/makeDateString';
import CreditCardModalContainer from 'universal/modules/userDashboard/containers/CreditCardModal/CreditCardModalContainer';

const ExpiredTrialCallOut = (props) => {
  const {orgId, periodEnd} = props;
  const trialEnd = makeDateString(periodEnd, false);
  const button = <Button colorPalette="cool" label="Add Billing Information" size={ui.ctaPanelButtonSize} />;
  const control = <CreditCardModalContainer orgId={orgId} toggle={button}/>;
  return (
    <CallOutPanel control={control} heading={'Your trial expired!'}>
      <span>Your 30-day trial expired on <b>{trialEnd}</b>. Add your <br />credit card to continue using Action with your teams.</span>
    </CallOutPanel>
  );
};


ExpiredTrialCallOut.propTypes = {
  orgId: PropTypes.string.isRequired,
  periodEnd: PropTypes.instanceOf(Date)
};

export default ExpiredTrialCallOut;
