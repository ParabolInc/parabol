const signalingServerPort = 4443
const signalingServerHostname = 'localhost'

export function getSignalingServerUrl(roomId: string, peerId: string) {
  const url = new URL(`wss://${signalingServerHostname}`)
  url.port = String(signalingServerPort)
  url.searchParams.append('roomId', roomId)
  url.searchParams.append('peerId', peerId)
  return url.toString()
}
