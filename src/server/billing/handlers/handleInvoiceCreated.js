import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {
  ADDED_USERS,
  REMOVED_USERS,
  INACTIVITY_ADJUSTMENTS,
  NEXT_MONTH_CHARGES,
  OTHER_ADJUSTMENTS
} from 'server/graphql/models/Invoice/invoiceSchema';
import {
  ADD_USER,
  AUTO_PAUSE_USER,
  PAUSE_USER,
  REMOVE_USER,
  UNPAUSE_USER
} from 'server/utils/serverConstants';
import {fromStripeDate} from 'server/billing/stripeDate';

export default async function handleInvoiceCreated(invoiceId) {
  const r = getRethink();

  const stripeLineItems = [];
  for (let i = 0; i < 100; i++) {
    const options = {limit: 100};
    if (i > 0) {
      options.starting_after = stripeLineItems[stripeLineItems.length - 1].id;
    }
    const invoiceLines = await stripe.invoices.retrieveLines(invoiceId, options);
    stripeLineItems.push(...invoiceLines.data);
    if (!invoiceLines.has_more) break;
  }

  const invoiceLineItems = [];
  const detailedLineItems = {
    // [ADDED_USERS]: [],
    // [REMOVED_USERS]: [],
    // [INACTIVITY_ADJUSTMENTS]: []
  };
  const itemDict = {};
  for (let i = 0; i < stripeLineItems.length; i++) {
    const lineItem = stripeLineItems[i];
    const {amount, metadata: {type, userId}, description, period: {start}, proration, quantity} = lineItem;
    if (description === null && proration === false) {
      // this must be the next month's charge
      invoiceLineItems.push({
        id: shortid.generate(),
        amount,
        type: NEXT_MONTH_CHARGES,
        quantity
      });
    } else if (!type || !userId) {
      invoiceLineItems.push({
        id: shortid.generate(),
        amount,
        description,
        quantity,
        type: OTHER_ADJUSTMENTS
      });
    } else {
      // at this point, we don't care whether it's an auto pause or manual
      const safeType = type === AUTO_PAUSE_USER ? PAUSE_USER : type;
      itemDict[userId] = itemDict[userId] || {};
      itemDict[userId][safeType] = itemDict[userId][safeType] || {};
      itemDict[userId][safeType][start] = itemDict[userId][safeType][start] || [];
      itemDict[userId][safeType][start].push(lineItem);
    }
  }
  const userIds = Object.keys(itemDict);
  const usersAndEmails = await r.table('User').getAll(r.args(userIds), {index: 'id'}).pluck('id', 'email');
  const emailLookup = usersAndEmails.reduce((dict, doc) => {
    dict[doc.id] = doc.email;
    return dict;
  }, {});
  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    const email = emailLookup[userId];
    const typesDict = itemDict[userId];
    const reducedItemsByType = {};
    const userTypes = Object.keys(typesDict);
    for (let j = 0; j < userTypes.length; j++) {
      const type = userTypes[j];
      const reducedItems = reducedItemsByType[type] = [];
      const startTimeDict = typesDict[type];
      const startTimes = Object.keys(startTimeDict);
      // unpausing someone ends a period, we'll use this later
      const dateField = type === UNPAUSE_USER ? 'endAt' : 'startAt';
      for (let k = 0; k < startTimes.length; k++) {
        const startTime = startTimes[k];
        const lineItems = startTimeDict[startTime];
        if (lineItems.length !== 2) {
          console.warn(`We did not get 2 line items. What do? Invoice: ${invoiceId}, ${JSON.stringify(lineItems)}`);
          return false;
        }
        reducedItems[k] = {
          id: shortid.generate(),
          amount: lineItems[0].amount + lineItems[1].amount,
          email,
          [dateField]: startTime
        }
      }
    }
    detailedLineItems[ADDED_USERS] = reducedItemsByType[ADD_USER] || [];
    detailedLineItems[REMOVED_USERS] = reducedItemsByType[REMOVE_USER] || [];
    const inactivityDetails = detailedLineItems[INACTIVITY_ADJUSTMENTS] = [];
    const pausedItems = reducedItemsByType[PAUSE_USER];
    const unpausedItems = reducedItemsByType[UNPAUSE_USER];

    // if an unpause happened before a pause, we know they came into this period paused, so we don't want a start date
    if (unpausedItems && (!pausedItems || unpausedItems[0].period.start < pausedItems[0].period.start)) {
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
      })
    }

    // if there is an extra pause, then it's because they are still on pause while we're invoicing.
    if (pausedItems.length > unpausedItems.length) {
      const lastPausedItem = pausedItems[pausedItems.length-1];
      inactivityDetails.push(lastPausedItem);
    }
  }

  // create invoice line items
  const lineItemTypes = Object.keys(detailedLineItems);
  for (let i = 0; i < lineItemTypes.length; i++) {
    const lineItemType = lineItemTypes[i];
    const details = detailedLineItems[lineItemType];
    if (details.length > 0) {
      const id = shortid.generate();
      invoiceLineItems.push({
        id,
        amount: details.reduce((sum, detail) => sum + detail.amount, 0),
        details: details.map((doc) => ({...doc, parentId: id})),
        quantity: details.length,
        type: lineItemType
      })
    }
  }

  const invoice = await stripe.invoices.retrieve(invoiceId);
  const customer = await stripe.customers.retrieve(invoice.customer);
  await r.table('Invoice').insert({
    id: invoiceId,
    amount: invoice.total,
    invoiceDate: fromStripeDate(invoice.date),
    startAt: fromStripeDate(invoice.period_start),
    endAt: fromStripeDate(invoice.period_end),
    lines: invoiceLineItems,
    orgId: customer.metadata.orgId
  });
  return true;
}
