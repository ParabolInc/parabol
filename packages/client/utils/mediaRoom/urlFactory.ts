const signalingServerPort = 4443
const signalingServerHostname = window.location.hostname

interface getSignalingServerUrlSignature {
  roomId: string
  peerId: string
  authToken: string
  teamId: string
}

export function getSignalingServerUrl({
  roomId,
  peerId,
  authToken,
  teamId
}: getSignalingServerUrlSignature) {
  const url = new URL(`wss://${signalingServerHostname}`)
  url.port = String(signalingServerPort)
  url.searchParams.append('roomId', roomId)
  url.searchParams.append('peerId', peerId)
  url.searchParams.append('authToken', authToken)
  url.searchParams.append('teamId', teamId)
  return url.toString()
}
