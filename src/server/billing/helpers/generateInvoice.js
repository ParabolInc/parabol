import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {
  FAILED,
  PAID,
  PENDING,
  UPCOMING,
  ADDED_USERS,
  BILLING_LEADER,
  REMOVED_USERS,
  INACTIVITY_ADJUSTMENTS,
  OTHER_ADJUSTMENTS
} from 'universal/utils/constants';
import {
  ADD_USER,
  AUTO_PAUSE_USER,
  PAUSE_USER,
  REMOVE_USER,
  UNPAUSE_USER
} from 'server/utils/serverConstants';
import {fromEpochSeconds} from 'server/utils/epochTime';

const getEmailLookup = async (userIds) => {
  const r = getRethink();
  const usersAndEmails = await r.table('User').getAll(r.args(userIds), {index: 'id'}).pluck('id', 'email');
  return usersAndEmails.reduce((dict, doc) => {
    dict[doc.id] = doc.email;
    return dict;
  }, {});
};

const reduceItemsByType = (typesDict, email, invoiceId) => {
  const userTypes = Object.keys(typesDict);
  const reducedItemsByType = {
    [ADD_USER]: [],
    [REMOVE_USER]: [],
    [PAUSE_USER]: [],
    [UNPAUSE_USER]: []
  };
  for (let j = 0; j < userTypes.length; j++) {
    // for each type
    const type = userTypes[j];
    const reducedItems = reducedItemsByType[type];
    const startTimeDict = typesDict[type];
    const startTimes = Object.keys(startTimeDict);
    // unpausing someone ends a period, we'll use this later
    const dateField = type === UNPAUSE_USER ? 'endAt' : 'startAt';
    for (let k = 0; k < startTimes.length; k++) {
      // for each time period
      const startTime = startTimes[k];
      const lineItems = startTimeDict[startTime];
      const firstLineItem = lineItems[0];
      if (lineItems.length !== 2) {
        if (firstLineItem.quantity !== 1) {
          console.warn(`We did not get 2 line items and qty > 1. What do? Invoice: ${invoiceId}, ${JSON.stringify(lineItems)}`);
          continue;
        }
      }
      const secondLineItemAmount = lineItems[1] ? lineItems[1].amount : 0;
      reducedItems[k] = {
        id: shortid.generate(),
        amount: firstLineItem.amount + secondLineItemAmount,
        email,
        [dateField]: fromEpochSeconds(startTime)
      };
    }
  }
  return reducedItemsByType;
};

const makeDetailedPauseEvents = (pausedItems, unpausedItems) => {
  const inactivityDetails = [];
  // if an unpause happened before a pause, we know they came into this period paused, so we don't want a start date
  if (unpausedItems.length > 0 && (pausedItems.length === 0 || unpausedItems[0].endAt < pausedItems[0].startAt)) {
    // mutative
    const firstUnpausedItem = unpausedItems.shift();
    inactivityDetails.push(firstUnpausedItem);
  }
  // match up every pause with an unpause so it's clear that Foo was paused for 5 days
  for (let j = 0; j < unpausedItems.length; j++) {
    const unpausedItem = unpausedItems[j];
    const pausedItem = pausedItems[j];
    inactivityDetails.push({
      ...pausedItem,
      amount: unpausedItem.amount + pausedItem.amount,
      endAt: unpausedItem.endAt
    });
  }

  // if there is an extra pause, then it's because they are still on pause while we're invoicing.
  if (pausedItems.length > unpausedItems.length) {
    const lastPausedItem = pausedItems[pausedItems.length - 1];
    inactivityDetails.push(lastPausedItem);
  }
  return inactivityDetails;
};

const makeQuantityChangeLineItems = (detailedLineItems) => {
  const quantityChangeLineItems = [];
  const lineItemTypes = Object.keys(detailedLineItems);
  for (let i = 0; i < lineItemTypes.length; i++) {
    const lineItemType = lineItemTypes[i];
    const details = detailedLineItems[lineItemType];
    if (details.length > 0) {
      const id = shortid.generate();
      quantityChangeLineItems.push({
        id,
        amount: details.reduce((sum, detail) => sum + detail.amount, 0),
        details: details.map((doc) => ({...doc, parentId: id})),
        quantity: details.length,
        type: lineItemType
      });
    }
  }
  return quantityChangeLineItems;
};

const makeDetailedLineItems = async (itemDict, invoiceId) => {
  // Make lookup table to get user Emails
  const userIds = Object.keys(itemDict);
  const emailLookup = await getEmailLookup(userIds);
  const detailedLineItems = {
    [ADDED_USERS]: [],
    [REMOVED_USERS]: [],
    [INACTIVITY_ADJUSTMENTS]: []
  };

  for (let i = 0; i < userIds.length; i++) {
    // for each userId
    const userId = userIds[i];
    const email = emailLookup[userId];
    const typesDict = itemDict[userId];
    const reducedItemsByType = reduceItemsByType(typesDict, email, invoiceId);
    const pausedItems = reducedItemsByType[PAUSE_USER];
    const unpausedItems = reducedItemsByType[UNPAUSE_USER];
    detailedLineItems[ADDED_USERS].push(...reducedItemsByType[ADD_USER]);
    detailedLineItems[REMOVED_USERS].push(...reducedItemsByType[REMOVE_USER]);
    detailedLineItems[INACTIVITY_ADJUSTMENTS].push(...makeDetailedPauseEvents(pausedItems, unpausedItems));
  }
  return detailedLineItems;
};

const addToDict = (itemDict, lineItem) => {
  const {metadata: {userId, type}, period: {start}} = lineItem;
  const safeType = type === AUTO_PAUSE_USER ? PAUSE_USER : type;
  itemDict[userId] = itemDict[userId] || {};
  itemDict[userId][safeType] = itemDict[userId][safeType] || {};
  itemDict[userId][safeType][start] = itemDict[userId][safeType][start] || [];
  itemDict[userId][safeType][start].push(lineItem);
};

const makeItemDict = (stripeLineItems) => {
  const itemDict = {};
  const unknownLineItems = [];
  let nextMonthCharges;
  for (let i = 0; i < stripeLineItems.length; i++) {
    const lineItem = stripeLineItems[i];
    const {amount, metadata, description, period: {end}, proration, quantity} = lineItem;
    if (description === null && proration === false) {
      // this must be the next month's charge
      nextMonthCharges = {
        // id: shortid.generate(),
        amount,
        // type: NEXT_MONTH_CHARGES,
        quantity,
        nextPeriodEnd: fromEpochSeconds(end),
        unitPrice: lineItem.plan.amount
      };
    } else if (!metadata.type) {
      unknownLineItems.push(lineItem);
    } else {
      // at this point, we don't care whether it's an auto pause or manual
      addToDict(itemDict, lineItem);
    }
  }
  return {itemDict, nextMonthCharges, unknownLineItems};
};

const maybeReduceUnknowns = async (unknownLineItems, itemDict, stripeSubscriptionId) => {
  const r = getRethink();
  const unknowns = [];
  for (let i = 0; i < unknownLineItems.length; i++) {
    const unknownLineItem = unknownLineItems[i];
    // this could be inefficient but if all goes as planned, we'll never use this function

    const hook = await r.table('InvoiceItemHook') // eslint-disable-line no-await-in-loop
      .getAll(unknownLineItem.period.start, {index: 'prorationDate'})
      .filter({stripeSubscriptionId})
      .nth(0)
      .default(null);
    if (hook) {
      const {type, userId} = hook;
      // push it back to stripe for posterity
      stripe.invoiceItems.update(unknownLineItem.id, {
        metadata: {
          type,
          userId
        }
      });
      // mutate the original line item
      unknownLineItem.metadata = {
        type,
        userId
      };
      addToDict(itemDict, unknownLineItem);
    } else {
      unknowns.push(unknownLineItem);
    }
  }
  return unknowns;
};


export default async function generateInvoice(invoice, stripeLineItems, orgId, invoiceId) {
  const r = getRethink();
  const now = new Date();

  const {itemDict, nextMonthCharges, unknownLineItems} = makeItemDict(stripeLineItems);
  // technically, invoice.created could be called before invoiceitem.created is if there is a network hiccup. mutates itemDict!
  const unknownInvoiceLines = await maybeReduceUnknowns(unknownLineItems, itemDict, invoice.subscription);
  const detailedLineItems = await makeDetailedLineItems(itemDict, invoiceId);
  const quantityChangeLineItems = makeQuantityChangeLineItems(detailedLineItems);
  const invoiceLineItems = [
    ...unknownInvoiceLines.map((item) => ({
      id: shortid.generate(),
      amount: item.amount,
      description: item.description,
      quantity: item.quantity,
      type: OTHER_ADJUSTMENTS
    })),
    ...quantityChangeLineItems
  ].sort((a, b) => a.type > b.type ? 1 : -1);

  // sanity check
  const calculatedTotal = invoiceLineItems.reduce((sum, {amount}) => sum + amount, 0) + nextMonthCharges.amount;
  if (calculatedTotal !== invoice.total) {
    console.warn('Calculated invoice does not match stripe invoice', invoiceId, calculatedTotal, invoice.total);
  }

  const [type] = invoiceId.split('_');
  const isUpcoming = type === 'upcoming';

  let status = isUpcoming ? UPCOMING : PENDING;
  if (status === PENDING && invoice.closed === true) {
    status = invoice.paid ? PAID : FAILED;
  }
  const paidAt = status === PAID ? now : undefined;

  return r.table('Organization').get(orgId)
    .do((org) => {
      return r.table('Invoice').insert({
        id: invoiceId,
        amountDue: invoice.amount_due,
        createdAt: now,
        total: invoice.total,
        billingLeaderEmails: r.table('User')
          .getAll(orgId, {index: 'userOrgs'})
          .filter((user) => user('userOrgs')
            .contains((userOrg) => userOrg('id').eq(orgId).and(userOrg('role').eq(BILLING_LEADER))))('email')
          .coerceTo('array'),
        creditCard: org('creditCard').default({}),
        endAt: fromEpochSeconds(invoice.period_end),
        invoiceDate: fromEpochSeconds(invoice.date),
        lines: invoiceLineItems,
        nextMonthCharges,
        orgId,
        orgName: org('name').default(null),
        paidAt,
        picture: org('picture').default(null),
        startAt: fromEpochSeconds(invoice.period_start),
        startingBalance: invoice.starting_balance,
        status
      }, {conflict: 'replace', returnChanges: true})('changes')(0)('new_val');
    });
}
