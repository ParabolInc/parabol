import firstErrorMessage from 'universal/utils/relay/firstErrorMessage';

type Error = {
  message: string
};

/*
 * A short helper function normally called within an onCompleted callback
 */
const callIfErrors = (onError: () => void, errors: ?Array<Error>) => {
  const err = firstErrorMessage(errors);
  if (err) {
    onError(err);
  }
};

export default callIfErrors;
