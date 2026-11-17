import {poolUnjudged} from '../poolUnjudged'
import type {LabeledQuery} from '../rescore'

const queries: LabeledQuery[] = [
  {query: 'alpha', relevant: {a: 3}},
  {query: 'nothing', relevant: {}}
]
const ranked = (query: string, resultKeys: string[]) => ({
  query,
  category: 'title',
  resultKeys,
  latencyMs: 1
})

it('pools the unlabeled top-10 pages of every arm, without arms or ranks', () => {
  const deep = Array.from({length: 12}, (_, i) => `deep${String(i).padStart(2, '0')}`)
  const master = [ranked('alpha', ['z', 'a', ...deep]), ranked('nothing', ['q'])]
  const candidate = [ranked('alpha', ['a', 'b', 'z']), ranked('nothing', ['r'])]
  expect(poolUnjudged([master, candidate], queries)).toEqual({
    alpha: ['b', ...deep.slice(0, 8), 'z']
  })
})
