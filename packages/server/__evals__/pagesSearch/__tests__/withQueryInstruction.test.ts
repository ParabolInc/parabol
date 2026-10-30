import withQueryInstruction from '../withQueryInstruction'

describe('withQueryInstruction', () => {
  it('wraps the query in the Qwen3 instruction format', () =>
    expect(withQueryInstruction('vendor list', 'Find pages')).toBe(
      'Instruct: Find pages\nQuery:vendor list'
    ))

  it('leaves the query alone without an instruction', () =>
    expect(withQueryInstruction('vendor list', undefined)).toBe('vendor list'))

  it('leaves the query alone with a blank instruction', () =>
    expect(withQueryInstruction('vendor list', '  ')).toBe('vendor list'))
})
