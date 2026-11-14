import compareVersions from '../compareVersions'

describe('compareVersions', () => {
  it('compares each part as a number', () => {
    expect(compareVersions('15.9.0', '15.10.0')).toBe(-1)
    expect(compareVersions('15.10.0', '15.9.0')).toBe(1)
    expect(compareVersions('9.0.0', '10.0.0')).toBe(-1)
    expect(compareVersions('15.16.2', '15.16.10')).toBe(-1)
  })

  it('finds equal versions equal', () => {
    expect(compareVersions('15.16.0', '15.16.0')).toBe(0)
    expect(compareVersions('v15.16.0', '15.16.0')).toBe(0)
  })

  it('goes by the release and ignores a prerelease suffix', () => {
    expect(compareVersions('15.16.0-rc.1', '15.16.0')).toBe(0)
    expect(compareVersions('15.16.0-rc.1', '15.17.0')).toBe(-1)
  })

  it('never orders a version it cannot read', () => {
    expect(compareVersions('', '15.16.0')).toBe(0)
    expect(compareVersions('15.16.0', 'undefined')).toBe(0)
    expect(compareVersions('15.16', '15.17.0')).toBe(0)
  })
})
