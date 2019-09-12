import shortid from 'shortid'
import {TierEnum} from 'parabol-client/types/graphql'
import CreditCard from './CreditCard'

interface Input {
  id?: string
  creditCard?: CreditCard
  createdAt?: Date
  name: string
  tier: TierEnum
  updatedAt?: Date
}

export default class Organization {
  id: string
  creditCard?: CreditCard
  createdAt: Date
  name: string
  tier: TierEnum
  updatedAt: Date
  constructor(input: Input) {
    const {id, createdAt, updatedAt, creditCard, name, tier} = input
    this.id = id || shortid.generate()
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    this.creditCard = creditCard
    this.name = name
    this.tier = tier
  }
}
