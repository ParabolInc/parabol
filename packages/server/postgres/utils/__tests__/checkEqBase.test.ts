import {areEqual} from '../checkEqBase'

describe('areEqual', () => {
  it('should ignore the order of keys in objects', () => {
    const a = {
      fieldName: 'Story point estimate',
      fieldType: 'number',
      fieldId: 'customfield_10016'
    }

    const b = {
      fieldId: 'customfield_10016',
      fieldName: 'Story point estimate',
      fieldType: 'number'
    }

    expect(areEqual(a, b)).toBe(true)
    expect(areEqual(b, a)).toBe(true)
  })
  it("should ignore object keys with `undefined` value if they're missing in another object", async () => {
    const a = {
      issueKey: undefined,
      fieldName: 'Story point estimate',
      fieldType: 'number',
      fieldId: 'customfield_10016'
    }

    const b = {
      fieldName: 'Story point estimate',
      fieldType: 'number',
      fieldId: 'customfield_10016'
    }

    expect(areEqual(a, b)).toBe(true)
    expect(areEqual(b, a)).toBe(true)
  })
  it("should not ignore object keys with `undefined` value if they're present in another object", () => {
    const a = {
      issueKey: undefined,
      fieldName: 'Story point estimate'
    }
    const b = {
      issueKey: 'issue key'
    }

    expect(areEqual(a, b)).toBe(false)
    expect(areEqual(b, a)).toBe(false)
  })
  it('should ignore the order of the elements in the array', () => {
    const a = [{k: 1}, {k: 2}, {k: 3}]
    const b = [{k: 3}, {k: 1}, {k: 2}]

    expect(areEqual(a, b)).toBe(true)
    expect(areEqual(b, a)).toBe(true)
  })
  it('should check all elements in array', () => {
    const a = [{k: 1}, {k: 1}, {k: 2}]
    const b = [{k: 1}, {k: 2}, {k: 3}]

    expect(areEqual(a, b)).toBe(false)
    expect(areEqual(b, a)).toBe(false)
  })
})
