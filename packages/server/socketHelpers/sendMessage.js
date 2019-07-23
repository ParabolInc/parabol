import sendRaw from 'server/socketHelpers/sendRaw'

const sendMessage = (transport, type, payload, opId) => {
  const message = {type}
  if (payload) message.payload = payload
  if (opId) message.id = opId
  sendRaw(transport, JSON.stringify(message))
}

export default sendMessage
