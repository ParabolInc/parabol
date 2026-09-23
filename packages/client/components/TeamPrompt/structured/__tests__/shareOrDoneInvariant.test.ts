import composerDoneVisible from '../composerDoneVisible'
import shareButtonState from '../shareButtonState'

const BOOLEANS = [false, true]
const ANSWERED_COUNTS = [0, 3]
const PROMPT_COUNT = 3

describe('a phone re-edit at rest always has a way out', () => {
  for (const isShared of BOOLEANS) {
    for (const isDirty of BOOLEANS) {
      for (const answeredCount of ANSWERED_COUNTS) {
        for (const isEnded of BOOLEANS) {
          const options = {
            isShared,
            isDirty,
            answeredCount,
            promptCount: PROMPT_COUNT,
            submitting: false,
            isEnded
          }
          const description = JSON.stringify(options)
          it(`Share is enabled or Done is visible when ${description}`, () => {
            const shareEnabled = !shareButtonState(options).disabled
            const doneVisible = composerDoneVisible({
              isPhone: true,
              isEditingAfterShare: true,
              ...options
            })
            expect(shareEnabled || doneVisible).toBe(true)
          })
        }
      }
    }
  }
})

describe('a submit in flight is a transient exception to the invariant', () => {
  const options = {
    isShared: false,
    isDirty: true,
    answeredCount: 3,
    promptCount: PROMPT_COUNT,
    submitting: true,
    isEnded: false
  }

  it('disables Share while submitting rather than leaving it clickable', () => {
    expect(shareButtonState(options).disabled).toBe(true)
  })

  it('hides Done while submitting so the card cannot be dismissed mid-save', () => {
    expect(composerDoneVisible({isPhone: true, isEditingAfterShare: true, ...options})).toBe(false)
  })
})
