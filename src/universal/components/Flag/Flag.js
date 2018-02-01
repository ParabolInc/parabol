// @flow
import type {Node} from 'react';

type NodeOrThunk = Node | () => Node;

type Props<T> = {
  when: T | () => T,
  switchOnVal?: T => NodeOrThunk,
  render?: NodeOrThunk,
  otherwise?: NodeOrThunk
};

const getNode = (nodeOrThunk: NodeOrThunk): Node =>
  typeof nodeOrThunk === 'function'
    ? nodeOrThunk()
    : nodeOrThunk;

/**
 * Conditionally renders components based on a `when` function.
 *
 * There are three ways to use this:
 *
 * 1) Show something based on a condition, otherwise show nothing.
 *   <Flag
 *     when={weCanReleaseNewUI} // `weCanReleaseNewUI` can be a value or a thunk
 *     render={NewUI}
 *   />
 *
 * 2) Show something based on a condition, otherwise show something else.
 *   <Flag
 *     when={weCanReleaseNewUI}
 *     render={<NewUI />}
 *     otherwise={<OldUI />}
 *   />
 *
 * 3) Show something as a function of the value returned by the `when` function.
 *   <Flag
 *     when={getUserCohort}
 *     onVal={(cohort) => {
 *       switch (cohort) {
 *         case 'group_a': return <OneNewFeature />
 *         case 'group_b': return <AnotherNewFeature />
 *         default:        return <TheCurrentFeature />
 *       }
 *     }}
 *   />
 */
const Flag = <T>(props: Props<T>) => {
  const {when, switchOnVal, render, otherwise} = props;
  const val = typeof when === 'function' ? when() : when;
  if (switchOnVal && !(render || otherwise)) {
    return getNode(switchOnVal(val));
  }
  if (render && !switchOnVal) {
    if (val) {
      return getNode(render);
    }
    return otherwise ? getNode(otherwise) : null;
  }
  throw new Error('Must provide one of: `switchOnVal`, `render`, or both (`render` and `otherwise`)');
};

export default Flag;
