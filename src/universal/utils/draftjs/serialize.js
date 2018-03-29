/**
 * Serializes a ContentState instance into a string.
 *
 * @flow
 */
// $FlowFixMe
import {convertToRaw} from 'draft-js';

import compose from '../../utils/compose';

export default compose(
  convertToRaw,
  JSON.stringify
);
