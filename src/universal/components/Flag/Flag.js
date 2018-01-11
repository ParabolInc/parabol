// @flow
import type { Node } from 'react';

type Props<T> = {
  when: () => T,
  switchOnVal?: T => Node,
  render?: () => Node,
  otherwise?: () => Node
};

/**
 * Conditionally renders components based on a `when` function.
 *
 * There are three ways to use this:
 *
 * 1) Show something based on a condition, otherwise show nothing.
 *   <Flag
 *     when={weCanReleaseNewUI}
 *     render={() => NewUI}
 *   />
 *
 * 2) Show something based on a condition, otherwise show something else.
 *   <Flag
 *     when={weCanReleaseNewUI}
 *     render={() => <NewUI />}
 *     otherwise={() => <OldUI />}
 *   />
 *
 * 3) Show something as a function of the value returned by the `when` function.
 *   <Flag
 *     when={getUserCohort}
 *     onVal={(cohort) => {
 *       switch (cohort) {
 *         case 'group_a': return () => <OneNewFeature />
 *         case 'group_b': return () => <AnotherNewFeature />
 *         default:        return () => <TheCurrentFeature />
 *       }
 *     }}
 *   />
 */
const Flag = <T>(props: Props<T>) => {
  const { when, switchOnVal, render, otherwise } = props;
  const val = when();
  if (switchOnVal && !(render || otherwise)) {
    return switchOnVal(val);
  }
  if (render) {
    if (val) {
      return render();
    }
    return otherwise ? otherwise() : null;
  }
  throw new Error('Must provide one of: `switchOnVal`, `render`, or both (`render` and `otherwise`)');
};

export default Flag;
