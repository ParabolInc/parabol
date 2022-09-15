import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r.table('InvoiceItemHook').indexCreate('stripeSubscriptionId').run()
    await r.table('InvoiceItemHook').indexDrop('userId').run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r.table('InvoiceItemHook').indexDrop('stripeSubscriptionId').run()
    await r.table('InvoiceItemHook').indexCreate('userId').run()
  } catch (e) {
    console.log(e)
  }
}
