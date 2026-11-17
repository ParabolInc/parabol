const SESSION_ID = /^[\w-]{1,64}$/

const parseSessionId = (sessionId: unknown) =>
  typeof sessionId === 'string' && SESSION_ID.test(sessionId) ? sessionId : undefined

export default parseSessionId
