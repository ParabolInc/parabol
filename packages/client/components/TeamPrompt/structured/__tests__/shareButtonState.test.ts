import shareButtonState from '../shareButtonState'

const base = {
  isShared: false,
  isDirty: false,
  answeredCount: 1,
  promptCount: 3,
  submitting: false,
  isEnded: false
}

describe('shareButtonState', () => {
  it('labels an unshared multi-prompt response in the plural', () => {
    expect(shareButtonState(base).label).toBe('Share Responses')
  })

  it('labels an unshared single-prompt response in the singular', () => {
    expect(shareButtonState({...base, promptCount: 1}).label).toBe('Share Response')
  })

  it('labels a shared response as changes', () => {
    expect(shareButtonState({...base, isShared: true, isDirty: true}).label).toBe('Share changes')
  })

  it('enables sharing once one prompt is answered', () => {
    expect(shareButtonState(base).disabled).toBe(false)
  })

  it('disables sharing when nothing is answered', () => {
    expect(shareButtonState({...base, answeredCount: 0}).disabled).toBe(true)
  })

  it('disables sharing while a save is in flight', () => {
    expect(shareButtonState({...base, submitting: true}).disabled).toBe(true)
  })

  it('disables a shared response until it is dirty again', () => {
    expect(shareButtonState({...base, isShared: true}).disabled).toBe(true)
    expect(shareButtonState({...base, isShared: true, isDirty: true}).disabled).toBe(false)
  })

  it('disables sharing once the meeting has ended', () => {
    expect(shareButtonState({...base, isEnded: true}).disabled).toBe(true)
  })
})
