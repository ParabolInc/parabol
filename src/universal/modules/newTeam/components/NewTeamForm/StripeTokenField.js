import React, {PropTypes} from 'react';
import FieldHelpText from 'universal/components/FieldHelpText/FieldHelpText';

const StripeTokenField = (props) => {
  const {meta: {touched, error}} = props;
  if (touched && error) {
    return <FieldHelpText hasErrorText helpText={error} />;
  }
  return null;
};

export default StripeTokenField;
