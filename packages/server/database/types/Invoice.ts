import CreditCard from './CreditCard'
import InvoiceLineItem from './InvoiceLineItem'
import InvoiceChargeNextMonth from './InvoiceChargeNextMonth'
import {InvoiceStatusEnum} from 'parabol-client/types/graphql'

interface Input {
  id: string,
  amountDue: number,
  createdAt?: Date,
  total: number,
  billingLeaderEmails: string[],
  creditCard: CreditCard,
  endAt: Date,
  invoiceDate: Date,
  lines: InvoiceLineItem[],
  nextMonthCharges: InvoiceChargeNextMonth,
  orgId: string,
  orgName?: string | null,
  paidAt?: Date | null,
  picture?: string | null,
  startAt: Date,
  startingBalance: number,
  status: InvoiceStatusEnum
}

export default class Invoice {
  id: string
  amountDue: number
  createdAt: Date
  total: number
  billingLeaderEmails: string[]
  creditCard: CreditCard
  endAt: Date
  invoiceDate: Date
  lines: InvoiceLineItem[]
  nextMonthCharges: InvoiceChargeNextMonth
  orgId: string
  orgName: string
  paidAt: Date | null
  picture: string | null
  startAt: Date
  startingBalance: number
  status: InvoiceStatusEnum

  constructor (input: Input) {
    const {id, createdAt, amountDue, billingLeaderEmails, creditCard, endAt, invoiceDate, lines, nextMonthCharges, orgId, orgName, paidAt, picture, startAt, startingBalance, status, total} = input
    this.id = id
    this.createdAt = createdAt || new Date()
    this.total = total
    this.billingLeaderEmails = billingLeaderEmails
    this.creditCard = creditCard || new CreditCard()
    this.amountDue = amountDue
    this.endAt = endAt
    this.invoiceDate = invoiceDate
    this.lines = lines
    this.nextMonthCharges = nextMonthCharges
    this.orgId = orgId
    this.orgName = orgName || 'Unknown Org'
    this.paidAt = paidAt || null
    this.picture = picture || null
    this.startAt = startAt
    this.startingBalance = startingBalance
    this.status = status
  }
}
