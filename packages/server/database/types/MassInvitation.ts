import {Security, Threshold} from 'parabol-client/types/constEnums'
import generateRandomString from '../../generateRandomString'

interface Input {
  id?: string
  expiration?: Date
  teamMemberId: string
}

export default class MassInvitation {
  id: string
  expiration: Date
  teamMemberId: string
  constructor(input: Input) {
    const {id, expiration, teamMemberId} = input
    this.id = id ?? generateRandomString(Security.MASS_INVITATION_TOKEN_LENGTH)
    this.expiration = expiration ?? new Date(Date.now() + Threshold.MASS_INVITATION_TOKEN_LIFESPAN)
    this.teamMemberId = teamMemberId
  }
}
