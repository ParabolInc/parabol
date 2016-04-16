export function parsedJoiErrors(error) {
  if (!error) {
    return {};
  }
  const errors = {};
  const allErrors = error.details;
  for (let index = 0; index < allErrors.length; index++) {
    const curError = allErrors[index];
    if (errors[curError.path]) {
      continue;
    }
    errors[curError.path] = curError.message;
  }
  return errors;
}
