import {makeConnectAttemptProps} from '../useConnectInMenu'

const setUp = (isCurrent = true) => {
  const base = {
    onCompleted: jest.fn(),
    onError: jest.fn(),
    submitMutation: jest.fn(),
    submitting: false
  }
  const setState = jest.fn()
  const props = makeConnectAttemptProps(
    base,
    {service: 'github', title: 'GitHub'},
    () => isCurrent,
    setState
  )
  return {base, setState, props}
}

describe('makeConnectAttemptProps', () => {
  it('returns to the menu when the connection is saved', () => {
    const {base, setState, props} = setUp()
    const res = {addTeamMemberIntegrationAuth: {teamMember: {id: 'tm1'}}}
    props.onCompleted(res)
    expect(base.onCompleted).toHaveBeenCalledWith(res, undefined)
    expect(setState).toHaveBeenCalledWith({phase: 'idle'})
  })

  it('shows the server’s error in the menu, not on the card', () => {
    const {base, setState, props} = setUp()
    props.onCompleted({addTeamMemberIntegrationAuth: {error: {message: 'Bad code'}}})
    expect(base.onCompleted).toHaveBeenCalledWith()
    expect(base.onError).not.toHaveBeenCalled()
    expect(setState).toHaveBeenCalledWith({
      phase: 'failed',
      service: 'github',
      title: 'GitHub',
      error: {message: 'Bad code'}
    })
  })

  it('treats a sign-in error, like a blocked popup, as a failed connection', () => {
    const {base, setState, props} = setUp()
    props.onError({message: 'Popup blocked'})
    expect(base.onCompleted).toHaveBeenCalledWith()
    expect(setState).toHaveBeenCalledWith(
      expect.objectContaining({phase: 'failed', error: {message: 'Popup blocked'}})
    )
  })

  it('ignores the result of an attempt that was cancelled', () => {
    const {base, setState, props} = setUp(false)
    props.onError({message: 'Popup closed'})
    props.onCompleted({addTeamMemberIntegrationAuth: {teamMember: {id: 'tm1'}}})
    expect(setState).not.toHaveBeenCalled()
    expect(base.onCompleted).toHaveBeenCalledTimes(2)
  })

  it('still marks the start of the server exchange', () => {
    const {base, props} = setUp()
    props.submitMutation()
    expect(base.submitMutation).toHaveBeenCalled()
  })
})
