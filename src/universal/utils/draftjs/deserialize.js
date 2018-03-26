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

// Note: throws an error if the serialized string cannot be parsed into JSON
export default (serialized: string): ContentState => (
  convertFromRaw(JSON.parse(serialized))
);
