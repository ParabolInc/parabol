import React, {PropTypes} from 'react';
import SummaryEmail from 'universal/modules/email/components/SummaryEmail/SummaryEmail';

const SummaryEmailContainer = (props) => {
  const {meeting} = props;
  const {id} = meeting;
  const referrerUrl = `https://action.parabol.co/summary/${id}`;
  return (
    <SummaryEmail
      meeting={meeting}
      referrer="email"
      referrerUrl={referrerUrl}
    />
  );
};

SummaryEmailContainer.propTypes = {
  meeting: PropTypes.object
};

export default SummaryEmailContainer;
