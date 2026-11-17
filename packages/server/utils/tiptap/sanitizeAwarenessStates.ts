const MAX_STATE_LENGTH = 4096
const MAX_NAME_LENGTH = 100
const HEX_COLOR = /^#[0-9a-f]{6}$/i

// Awareness is relayed to every viewer, read-only ones included, so it must not carry another user's identity or CSS
export const sanitizeAwarenessStates = (
  documentName: string,
  userId: string | undefined,
  states: Map<number, Record<string, any>>
) => {
  states.forEach((state, clientId) => {
    if (documentName.startsWith('meeting:')) {
      states.set(clientId, {userId: state.userId && userId ? userId : null})
      return
    }
    if (JSON.stringify(state).length > MAX_STATE_LENGTH) {
      states.delete(clientId)
      return
    }
    const {user} = state
    if (user === undefined) return
    if (typeof user !== 'object' || user === null) {
      delete state.user
      return
    }
    state.user = {
      name: typeof user.name === 'string' ? user.name.slice(0, MAX_NAME_LENGTH) : '',
      color: typeof user.color === 'string' && HEX_COLOR.test(user.color) ? user.color : '#808080'
    }
  })
}
