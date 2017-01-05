
/*
 * The default redux-form shouldValidate function always validates on
 * the initial render. In our Cashay app, the initial render is probably
 * a terrible time to do validation as the fields we want to validate
 * are probably empty.
 */

export default function shouldValidate({
  values,
  nextProps,
  initialRender,
  lastFieldValidatorKeys,
  fieldValidatorKeys,
  structure
}) {
  if (initialRender) {
    return false;
  }
  return !structure.deepEqual(values, nextProps.values) ||
    !structure.deepEqual(lastFieldValidatorKeys, fieldValidatorKeys);
}
