import composerDoneVisible from '../composerDoneVisible'

const base = {
  isPhone: true,
  isEditingAfterShare: true,
  isShared: true,
  isDirty: false,
  answeredCount: 3,
  promptCount: 3,
  submitting: false,
  isEnded: false
}

it('offers Done whenever there is nothing to share', () => {
  expect(composerDoneVisible(base)).toBe(true)
})

it('offers Done when every answer was cleared, which also disables sharing', () => {
  expect(composerDoneVisible({...base, isDirty: true, answeredCount: 0})).toBe(true)
})

it('hides Done while Share changes is the way out', () => {
  expect(composerDoneVisible({...base, isDirty: true})).toBe(false)
})

it('hides Done while a share is in flight', () => {
  expect(composerDoneVisible({...base, isDirty: true, submitting: true})).toBe(false)
})

it('never offers Done outside a phone re-edit', () => {
  expect(composerDoneVisible({...base, isPhone: false})).toBe(false)
  expect(composerDoneVisible({...base, isEditingAfterShare: false})).toBe(false)
})

it('offers Done when the meeting ends mid-edit', () => {
  expect(composerDoneVisible({...base, isDirty: true, isEnded: true})).toBe(true)
})
