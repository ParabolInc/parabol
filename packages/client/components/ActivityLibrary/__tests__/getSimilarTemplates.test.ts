import {getSimilarTemplates} from '../getSimilarTemplates'

const template = (id: string) => ({id})

describe('getSimilarTemplates', () => {
  it('dedupes keyword matches', () => {
    const result = getSimilarTemplates(
      [template('a'), template('b'), template('c')],
      [template('b')]
    )
    expect(result.map(({id}) => id)).toEqual(['a', 'c'])
  })

  it('preserves server order', () => {
    const result = getSimilarTemplates([template('z'), template('a'), template('m')], [])
    expect(result.map(({id}) => id)).toEqual(['z', 'a', 'm'])
  })

  it('returns all results when no keyword matches', () => {
    const searchResults = [template('a'), template('b')]
    expect(getSimilarTemplates(searchResults, [])).toEqual(searchResults)
  })
})
