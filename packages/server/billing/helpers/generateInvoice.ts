import {InvoiceItemType} from 'parabol-client/types/constEnums'
import Stripe from 'stripe'
import getRethink from '../../database/rethinkDriver'
import Coupon from '../../database/types/Coupon'
import Invoice, {InvoiceStatusEnum} from '../../database/types/Invoice'
import {InvoiceLineItemEnum} from '../../database/types/InvoiceLineItem'
import InvoiceLineItemDetail from '../../database/types/InvoiceLineItemDetail'
import InvoiceLineItemOtherAdjustments from '../../database/types/InvoiceLineItemOtherAdjustments'
import NextPeriodCharges from '../../database/types/NextPeriodCharges'
import Organization from '../../database/types/Organization'
import QuantityChangeLineItem from '../../database/types/QuantityChangeLineItem'
import generateUID from '../../generateUID'
import {DataLoaderWorker} from '../../graphql/graphql'
import isValid from '../../graphql/isValid'
import {fromEpochSeconds} from '../../utils/epochTime'
import sendToSentry from '../../utils/sendToSentry'
import {getStripeManager} from '../../utils/stripe'

interface InvoicesByStartTime {
  [start: string]: {
    unusedTime?: Stripe.InvoiceLineItem
    remainingTime?: Stripe.InvoiceLineItem
  }
}

interface TypesDict {
  pauseUser: InvoicesByStartTime
  unpauseUser: InvoicesByStartTime
  addUser: InvoicesByStartTime
  removeUser: InvoicesByStartTime
}

interface ItemDict {
  [userId: string]: TypesDict
}

interface EmailLookup {
  [userId: string]: string
}

interface ReducedItemBase {
  id: string
  amount: number
  email: string
}

interface ReducedUnpausePartial extends ReducedItemBase {
  endAt: Date
}

interface ReducedStandardPartial extends ReducedItemBase {
  startAt: Date
}

interface ReducedItem extends ReducedItemBase {
  startAt?: Date | null
  endAt?: Date | null
}

interface ReducedItemsByType {
  addUser: ReducedStandardPartial[]
  removeUser: ReducedStandardPartial[]
  pauseUser: ReducedStandardPartial[]
  unpauseUser: ReducedUnpausePartial[]
}

interface DetailedLineItemDict {
  ADDED_USERS: ReducedStandardPartial[]
  REMOVED_USERS: ReducedStandardPartial[]
  INACTIVITY_ADJUSTMENTS: ReducedItem[]
}

const getEmailLookup = async (userIds: string[], dataLoader: DataLoaderWorker) => {
  const usersAndEmails = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
  return usersAndEmails.reduce((dict, doc) => {
    if (doc) {
      dict[doc.id] = doc.email
    }
    return dict
  }, {} as {[key: string]: string}) as EmailLookup
}

const reduceItemsByType = (typesDict: TypesDict, email: string) => {
  const userTypes = Object.keys(typesDict) as (keyof TypesDict)[]
  const reducedItemsByType: ReducedItemsByType = {
    addUser: [] as ReducedStandardPartial[],
    removeUser: [] as ReducedStandardPartial[],
    pauseUser: [] as ReducedStandardPartial[],
    unpauseUser: [] as ReducedUnpausePartial[]
  }
  for (let j = 0; j < userTypes.length; j++) {
    // for each type
    const type = userTypes[j]!
    const reducedItems = reducedItemsByType[type]
    const startTimeDict = typesDict[type]
    const startTimes = Object.keys(startTimeDict)
    // unpausing someone ends a period, we'll use this later
    const dateField = type === InvoiceItemType.UNPAUSE_USER ? 'endAt' : 'startAt'
    for (let k = 0; k < startTimes.length; k++) {
      // for each time period
      const startTime = startTimes[k]!
      const lineItems = startTimeDict[startTime]!
      // combine unusedTime with remainingTime to create a single activity
      const {unusedTime, remainingTime} = lineItems
      const unusedTimeAmount = unusedTime ? unusedTime.amount : 0
      const remainingTimeAmount = remainingTime ? remainingTime.amount : 0
      reducedItems[k] = {
        id: generateUID(),
        amount: unusedTimeAmount + remainingTimeAmount,
        email,
        [dateField]: fromEpochSeconds(startTime)
      } as unknown as ReducedUnpausePartial | ReducedStandardPartial
    }
  }
  return reducedItemsByType
}

const makeDetailedPauseEvents = (
  pausedItems: ReducedStandardPartial[],
  unpausedItems: ReducedUnpausePartial[]
) => {
  const inactivityDetails: ReducedItem[] = []
  // if an unpause happened before a pause, we know they came into this period paused, so we don't want a start date
  // really this should be an if clause, but there are some errors cases where multiple unpause events were sent for the same user
  while (
    unpausedItems.length > 0 &&
    (pausedItems.length === 0 || unpausedItems[0]!.endAt < pausedItems[0]!.startAt)
  ) {
    // mutative
    const firstUnpausedItem = unpausedItems.shift()!
    inactivityDetails.push(firstUnpausedItem)
  }
  // match up every pause with an unpause so it's clear that Foo was paused for 5 days
  for (let j = 0; j < unpausedItems.length; j++) {
    const unpausedItem = unpausedItems[j]!
    const pausedItem = pausedItems[j]!
    inactivityDetails.push({
      ...pausedItem,
      amount: unpausedItem.amount + pausedItem.amount,
      endAt: unpausedItem.endAt
    })
  }

  // if there is an extra pause, then it's because they are still on pause while we're invoicing.
  if (pausedItems.length > unpausedItems.length) {
    const lastPausedItem = pausedItems[pausedItems.length - 1]!
    inactivityDetails.push(lastPausedItem)
  }
  return inactivityDetails
}

const makeQuantityChangeLineItems = (detailedLineItems: DetailedLineItemDict) => {
  const quantityChangeLineItems: QuantityChangeLineItem[] = []
  const lineItemTypes = Object.keys(detailedLineItems) as (keyof DetailedLineItemDict)[]
  for (let i = 0; i < lineItemTypes.length; i++) {
    const lineItemType = lineItemTypes[i]!
    const details = detailedLineItems[lineItemType] as ReducedItem[]
    if (details.length > 0) {
      const id = generateUID()
      quantityChangeLineItems.push(
        new QuantityChangeLineItem({
          id,
          amount: details.reduce((sum, detail) => sum + detail.amount, 0),
          details: details.map((doc) => new InvoiceLineItemDetail({...doc, parentId: id})),
          quantity: details.length,
          type: lineItemType as InvoiceLineItemEnum
        })
      )
    }
  }
  return quantityChangeLineItems
}

const makeDetailedLineItems = async (itemDict: ItemDict, dataLoader: DataLoaderWorker) => {
  // Make lookup table to get user Emails
  const userIds = Object.keys(itemDict)
  const emailLookup = await getEmailLookup(userIds, dataLoader)
  const detailedLineItems = {
    ADDED_USERS: [] as ReducedStandardPartial[],
    REMOVED_USERS: [] as ReducedStandardPartial[],
    INACTIVITY_ADJUSTMENTS: [] as ReducedItem[]
  } as DetailedLineItemDict

  for (let i = 0; i < userIds.length; i++) {
    // for each userId
    const userId = userIds[i]!
    const email = emailLookup[userId]!
    const typesDict = itemDict[userId]!
    const reducedItemsByType = reduceItemsByType(typesDict, email)
    const pausedItems = reducedItemsByType.pauseUser
    const unpausedItems = reducedItemsByType.unpauseUser
    detailedLineItems.ADDED_USERS.push(...reducedItemsByType.addUser)
    detailedLineItems.REMOVED_USERS.push(...reducedItemsByType.removeUser)
    detailedLineItems.INACTIVITY_ADJUSTMENTS.push(
      ...makeDetailedPauseEvents(pausedItems, unpausedItems)
    )
  }
  return detailedLineItems
}

const addToDict = (itemDict: ItemDict, lineItem: Stripe.InvoiceLineItem) => {
  const {
    metadata,
    period: {start}
  } = lineItem
  const userId = metadata.userId!
  const type = metadata.type as InvoiceItemType
  const safeType = type === InvoiceItemType.AUTO_PAUSE_USER ? InvoiceItemType.PAUSE_USER : type
  itemDict[userId] = itemDict[userId] || ({} as TypesDict)
  const userItemDict = itemDict[userId]!
  userItemDict[safeType] = userItemDict[safeType] || {}
  userItemDict[safeType][start] = userItemDict[safeType][start] || {}
  const startTimeItems = userItemDict[safeType][start] as InvoicesByStartTime['start']
  const bucket = lineItem.amount < 0 ? 'unusedTime' : 'remainingTime'
  // an identical line item may already exist in the bucket, e.g. a user was removed & prorated to the exact same timestamp (subscription start)
  // since the start time is the same, we know the amount will be the same, so we do this to avoid a duplicate line item on the invoice
  startTimeItems[bucket] = lineItem
}

const makeItemDict = (stripeLineItems: Stripe.InvoiceLineItem[]) => {
  const itemDict = {} as ItemDict
  const unknownLineItems = [] as Stripe.InvoiceLineItem[]
  let nextPeriodCharges!: NextPeriodCharges
  for (let i = 0; i < stripeLineItems.length; i++) {
    const lineItem = stripeLineItems[i]!
    const {
      amount,
      metadata,
      period: {end},
      proration,
      quantity
    } = lineItem
    const lineItemQuantity = quantity ?? 0
    if (proration === false) {
      if (!nextPeriodCharges) {
        // this must be the next month's charge
        nextPeriodCharges = new NextPeriodCharges({
          amount,
          quantity: lineItemQuantity,
          nextPeriodEnd: fromEpochSeconds(end),
          unitPrice: lineItem.plan?.amount || undefined,
          interval: lineItem.plan?.interval || 'month'
        })
      } else {
        //merge the quantity & price line for enterprise
        nextPeriodCharges.amount = nextPeriodCharges.amount || amount
        nextPeriodCharges.quantity = nextPeriodCharges.quantity || lineItemQuantity
      }
    } else if (!metadata.type) {
      unknownLineItems.push(lineItem)
    } else {
      // at this point, we don't care whether it's an auto pause or manual
      addToDict(itemDict, lineItem)
    }
  }
  return {itemDict, nextPeriodCharges, unknownLineItems}
}

const maybeReduceUnknowns = async (
  unknownLineItems: Stripe.InvoiceLineItem[],
  itemDict: ItemDict,
  stripeSubscriptionId: string
) => {
  const r = await getRethink()
  const unknowns = [] as Stripe.InvoiceLineItem[]
  const manager = getStripeManager()
  for (let i = 0; i < unknownLineItems.length; i++) {
    const unknownLineItem = unknownLineItems[i]!
    // this could be inefficient but if all goes as planned, we'll never use this function

    const hook = await r
      .table('InvoiceItemHook') // eslint-disable-line no-await-in-loop
      .getAll(unknownLineItem.period.start, {index: 'prorationDate'})
      .filter({stripeSubscriptionId})
      .nth(0)
      .default(null)
      .run()
    if (hook) {
      const {id: hookId, type, userId} = hook
      // push it back to stripe for posterity
      if (unknownLineItem.invoice_item) {
        manager.updateInvoiceItem(unknownLineItem.invoice_item, type, userId, hookId).catch()
      }
      // mutate the original line item
      unknownLineItem.metadata = {
        type,
        userId
      }
      addToDict(itemDict, unknownLineItem)
    } else {
      unknowns.push(unknownLineItem)
    }
  }
  return unknowns
}

export default async function generateInvoice(
  invoice: Stripe.Invoice,
  stripeLineItems: Stripe.InvoiceLineItem[],
  orgId: string,
  invoiceId: string,
  dataLoader: DataLoaderWorker
) {
  const r = await getRethink()
  const now = new Date()

  const {itemDict, nextPeriodCharges, unknownLineItems} = makeItemDict(stripeLineItems)
  // technically, invoice.created could be called before invoiceitem.created is if there is a network hiccup. mutates itemDict!
  const unknownInvoiceLines = await maybeReduceUnknowns(
    unknownLineItems,
    itemDict,
    invoice.subscription as string
  )
  const detailedLineItems = await makeDetailedLineItems(itemDict, dataLoader)
  const quantityChangeLineItems = makeQuantityChangeLineItems(detailedLineItems)
  const invoiceLineItems = [
    ...unknownInvoiceLines.map(
      (item) =>
        new InvoiceLineItemOtherAdjustments({
          amount: item.amount,
          description: item.description,
          quantity: item.quantity ?? 0
        })
    ),
    ...quantityChangeLineItems
  ].sort((a, b) => (a.type > b.type ? 1 : -1))

  // sanity check
  const calculatedTotal =
    invoiceLineItems.reduce((sum, {amount}) => sum + amount, 0) + nextPeriodCharges.amount
  if (calculatedTotal !== invoice.total) {
    sendToSentry(new Error('Calculated invoice does not match stripe invoice'), {
      tags: {invoiceId, calculatedTotal, invoiceTotal: invoice.total}
    })
  }

  const [type] = invoiceId.split('_')
  const isUpcoming = type === 'upcoming'

  const statusLookup = {
    paid: 'PAID',
    draft: 'PENDING',
    open: 'PENDING'
  } as Record<Stripe.Invoice.Status, InvoiceStatusEnum>

  const status: InvoiceStatusEnum = isUpcoming
    ? 'UPCOMING'
    : statusLookup[invoice.status!] || 'FAILED'
  const paidAt =
    invoice.status === 'paid' && invoice.status_transitions.paid_at
      ? fromEpochSeconds(invoice.status_transitions.paid_at)
      : undefined

  const {organization, billingLeaderIds} = await r({
    organization: r.table('Organization').get(orgId) as unknown as Organization,
    billingLeaderIds: r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null, role: 'BILLING_LEADER'})
      .coerceTo('array')('userId') as unknown as string[]
  }).run()

  const billingLeaders = (await dataLoader.get('users').loadMany(billingLeaderIds)).filter(isValid)
  const billingLeaderEmails = billingLeaders.map((user) => user.email)

  const couponDetails = (invoice.discount && invoice.discount.coupon) || null
  const coupon =
    (couponDetails?.name &&
      new Coupon({
        id: couponDetails.id,
        amountOff: couponDetails.amount_off ?? 0,
        name: couponDetails.name,
        percentOff: couponDetails.percent_off ?? 0
      })) ||
    null

  const dbInvoice = new Invoice({
    id: invoiceId,
    amountDue: invoice.amount_due,
    createdAt: now,
    coupon,
    total: invoice.total,
    billingLeaderEmails,
    creditCard: organization.creditCard,
    endAt: fromEpochSeconds(invoice.period_end),
    invoiceDate: fromEpochSeconds(invoice.due_date!),
    lines: invoiceLineItems,
    nextPeriodCharges,
    orgId,
    orgName: organization.name,
    paidAt,
    picture: organization.picture,
    startAt: fromEpochSeconds(invoice.period_start),
    startingBalance: invoice.starting_balance,
    status,
    tier: nextPeriodCharges.interval === 'year' ? 'enterprise' : 'team'
  })

  return r
    .table('Invoice')
    .insert(dbInvoice, {conflict: 'replace', returnChanges: true})('changes')(0)('new_val')
    .run()
}
