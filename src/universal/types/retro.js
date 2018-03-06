/**
 * Defines types for the retrospective meeting.
 *
 * @flow
 */
// $FlowFixMe
import {ContentState} from 'draft-js';

export type Stage = 'positive' | 'negative' | 'change';

export type ReflectionID = string;

export type Reflection = {
  id: ReflectionID,
  content: ContentState,
  stage: ?Stage
};
