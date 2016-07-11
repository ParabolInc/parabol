import {authedOptions} from 'universal/redux/getAuthedUser';
import requireAuthAndRole from '../requireAuthAndRole/requireAuthAndRole';

/*
 * A little syntactic sugar, if we only an authenticated user still
 * user requireAuthAndRole but pass it an undefined role to match. This
 * checks only for an authenticated user.
 */
export default (cashayAuthQueryOpts = authedOptions) => (ComposedComponent) =>
  requireAuthAndRole(null, cashayAuthQueryOpts)(ComposedComponent);
