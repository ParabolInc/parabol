import OfferSignal from './OfferSignal'
import CandidateSignal from './CandidateSignal'

export default class ConnectionChunk {
  signals: (OfferSignal | CandidateSignal)[]

  constructor(public id: string, sdp: string) {
    this.signals = [new OfferSignal(sdp)]
  }
}
