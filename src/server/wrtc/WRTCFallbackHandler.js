import FastRTCPeer, {CANDIDATE, DATA, SIGNAL} from '@mattkrick/fast-rtc-peer'
import wrtc from 'wrtc'

const WRTCFallbackHandler = (req, res) => {
  const {body} = req
  const peer = new FastRTCPeer({wrtc})
  // const answer = []
  peer.on(SIGNAL, (payload) => {
    if (payload.type === CANDIDATE && payload.candidate === null) {
      res.end()
    } else {
      res.write(JSON.stringify(payload))
    }
  })
  peer.on(DATA, (data, peer) => {
    console.log(`got message ${data} from ${peer.id}`)
  })
  body.forEach((msg) => {
    peer.dispatch(msg)
  })
}

export default WRTCFallbackHandler
