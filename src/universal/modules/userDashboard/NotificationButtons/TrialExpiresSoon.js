import React, {Component, PropTypes} from 'react';
import {withRouter} from 'react-router';
import Button from 'universal/components/Button/Button';

const TrialExpiresSoon = (props) => {
  const {router, varList} = props;
  const orgId = varList[1];
  const addBilling = () => {
    router.push(`/me/organizations/${orgId}`)
  };
  return (
    <Button
      colorPalette="warm"
      isBlock
      label="Add Billing"
      size="small"
      type="submit"
      onClick={addBilling}
    />
  )
};

export default withRouter(TrialExpiresSoon);


