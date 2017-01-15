import stripe from 'stripe';
import getRethink from 'server/database/rethinkDriver';

export default async function handleUpdatedSource(invoiceId) {
  const r = getRethink();

}
