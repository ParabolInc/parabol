import {resolveSheetDismiss} from '../resolveSheetDismiss'

describe('resolveSheetDismiss', () => {
  it('stays open when the drag is below both thresholds', () => {
    expect(resolveSheetDismiss(40, 100)).toBe(false)
  })

  it('closes when the vertical offset clears the distance threshold', () => {
    expect(resolveSheetDismiss(81, 0)).toBe(true)
  })

  it('treats the distance threshold as exclusive', () => {
    expect(resolveSheetDismiss(80, 0)).toBe(false)
  })

  it('closes when a fast flick clears the velocity threshold', () => {
    expect(resolveSheetDismiss(10, 501)).toBe(true)
  })

  it('treats the velocity threshold as exclusive', () => {
    expect(resolveSheetDismiss(10, 500)).toBe(false)
  })

  it('stays open when dragging upward', () => {
    expect(resolveSheetDismiss(-120, -600)).toBe(false)
  })
})
