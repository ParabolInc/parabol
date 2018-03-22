/**
 * Deserializes a utf-8-encode JSON string into a draft-js ContentState instance.
 *
 * Fails "soft" by returning an empty ContentState rather than throwing an
 * error on deserialization.
 *
 * @flow
 */

// $FlowFixMe
import {convertFromRaw, ContentState} from 'draft-js';

export default (serialized: string): ContentState => {
  try {
    return convertFromRaw(JSON.parse(serialized));
  } catch (error) {
    return ContentState.createFromText('');
  }
};
