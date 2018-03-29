/**
 * Maps a function over three `maybe` functors.
 *
 * @flow
 */
import type {Maybe} from 'maeby';

const fmap3 = <A, B, C, D>(fn: (A, B, C) => D, maybeA: Maybe<A>, maybeB: Maybe<B>, maybeC: Maybe<C>) => (
  maybeA.bind((a: A) =>
    maybeB.bind((b: B) =>
      maybeC.bind((c: C) =>
        fn(a, b, c)
      )
    )
  )
);

export default fmap3;
