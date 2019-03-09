import OfferSignal from './OfferSignal'
import CandidateSignal from './CandidateSignal'

export default class ConnectionChunk {
  signals: Array<OfferSignal | CandidateSignal>

  constructor (public connectionId: string, sdp: string) {
    this.signals = [new OfferSignal(sdp)]
  }
}
