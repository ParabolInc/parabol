import {isClientOutdated} from './connectedServerVersion'

export const STALE_CLIENT_NOTE = 'You’re on an older version of Parabol. Reload to update it.'

const MAX_SERVER_ERROR_MESSAGES = 20
const serverErrorMessages: string[] = []

export const rememberServerErrors = (errors: readonly {message?: string}[] | null | undefined) => {
  errors?.forEach(({message}) => {
    if (!message || serverErrorMessages.includes(message)) return
    serverErrorMessages.push(message)
    if (serverErrorMessages.length > MAX_SERVER_ERROR_MESSAGES) serverErrorMessages.shift()
  })
}

// Only an error the server sent can come from the version gap. A message checked in this client cannot
export const withStaleClientNote = (message: string) => {
  if (!isClientOutdated()) return message
  if (!serverErrorMessages.some((serverMessage) => message.includes(serverMessage))) return message
  const sentence = /[.!?]$/.test(message.trim()) ? message.trim() : `${message.trim()}.`
  return `${sentence} ${STALE_CLIENT_NOTE}`
}
