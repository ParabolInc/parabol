// @flow
import type {StandardMutationError} from 'universal/types/schema.flow';

type Context = {
  environment: Object
}

type Options = {
  popToast?: boolean,
}

const handleMutationError = (error: StandardMutationError, context: Context, options: Options = {}) => {
  if (!error) return;
  const {title, message} = error;
  console.error(title, message);
  const {popToast} = options;
  if (popToast) {
    // const {environment} = context;
    // TODO pop a toast once Relay supports creating a local type
  }
};

export default handleMutationError;
