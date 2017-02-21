import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {
  ADDED_USERS,
  REMOVED_USERS,
  INACTIVITY_ADJUSTMENTS,
  NEXT_MONTH_CHARGES,
  OTHER_ADJUSTMENTS,
  PREVIOUS_BALANCE,
  PENDING
} from 'server/graphql/models/Invoice/invoiceSchema';
import {
  ADD_USER,
  AUTO_PAUSE_USER,
  PAUSE_USER,
  REMOVE_USER,
  UNPAUSE_USER
} from 'server/utils/serverConstants';
import {fromEpochSeconds} from 'server/utils/epochTime';

const fetchAllLines = async(invoiceId) => {
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
  return stripeLineItems;
};

const getEmailLookup = async(userIds) => {
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
      if (lineItems.length !== 2) {
        console.warn(`We did not get 2 line items. What do? Invoice: ${invoiceId}, ${JSON.stringify(lineItems)}`);
        return false;
      }
      reducedItems[k] = {
        id: shortid.generate(),
        amount: lineItems[0].amount + lineItems[1].amount,
        email,
        [dateField]: startTime
      };
    }
  }
  return reducedItemsByType;
};

const makeDetailedPauseEvents = (pausedItems, unpausedItems) => {
  const inactivityDetails = [];
  // if an unpause happened before a pause, we know they came into this period paused, so we don't want a start date
  if (unpausedItems && (!pausedItems || unpausedItems[0].endAt < pausedItems[0].startAt)) {
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

const makeDetailedLineItems = async(itemDict, invoiceId) => {
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

const makeItemDict = (stripeLineItems) => {
  const itemDict = {};
  const unknownLineItems = [];
  for (let i = 0; i < stripeLineItems.length; i++) {
    const lineItem = stripeLineItems[i];
    const {amount, metadata: {type, userId}, description, period: {start}, proration, quantity} = lineItem;
    if (description === null && proration === false) {
      // this must be the next month's charge
      unknownLineItems.push({
        id: shortid.generate(),
        amount,
        type: NEXT_MONTH_CHARGES,
        quantity
      });
    } else if (!type || !userId) {
      unknownLineItems.push({
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
  return {itemDict, unknownLineItems};
};

export default async function handleInvoiceCreated(invoiceId) {
  const r = getRethink();

  const stripeLineItems = await fetchAllLines(invoiceId);
  const invoice = await stripe.invoices.retrieve(invoiceId);
  const {metadata: {orgId}} = await stripe.customers.retrieve(invoice.customer);
  const {itemDict, unknownLineItems} = makeItemDict(stripeLineItems);
  const detailedLineItems = await makeDetailedLineItems(itemDict, invoiceId);
  const quantityChangeLineItems = makeQuantityChangeLineItems(detailedLineItems);

  const previousBalance = {
    id: shortid.generate(),
    amount: invoice.starting_balance,
    type: PREVIOUS_BALANCE
  };
  const invoiceLineItems = [
    ...unknownLineItems,
    ...quantityChangeLineItems,
    previousBalance
  ];

  console.log('setting invoice metadata', orgId);
  await stripe.invoices.update(invoiceId, {
    metadata: {
      orgId
    }
  });

  // sanity check
  const calculatedAmountDue = invoiceLineItems.reduce((sum, {amount}) => sum + amount, 0);
  if (calculatedAmountDue !== invoice.amount_due) {
    console.log('Calculated invoice does not match stripe invoice', invoiceId);
  }

  await r.table('Invoice').insert({
    id: invoiceId,
    amount: invoice.amount_due,
    endAt: fromEpochSeconds(invoice.period_end),
    invoiceDate: fromEpochSeconds(invoice.date),
    lines: invoiceLineItems,
    orgId,
    startAt: fromEpochSeconds(invoice.period_start),
    status: PENDING
  });
  return true;
}
