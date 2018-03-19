/**
 * Defines types for the retrospective meeting.
 *
 * @flow
 */
// $FlowFixMe
import {ContentState} from 'draft-js';

export type ReflectionGroupID = string;

export type ReflectionID = string;

export type Reflection = {
  id: ReflectionID,
  content: ContentState,
  type: ?string
};

export type ReflectionGroup = {
  id: ReflectionGroupID,
  title: string,
  reflections: Array<Reflection>
};
