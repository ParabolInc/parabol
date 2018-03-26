/**
 * Maps a function over two `maybe` functors.
 *
 * @flow
 */
import type {Maybe} from 'maeby';

const fmap2 = <A, B, C>(fn: (A, B) => C, maybeA: Maybe<A>, maybeB: Maybe<B>) => (
  maybeA.bind((a: A) =>
    maybeB.bind((b: B) =>
      fn(a, b)
    )
  )
);

export default fmap2;
