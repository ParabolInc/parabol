// import stripe from './stripe';
// import ms from 'ms';
// import MockDB from '../__tests__/setup/MockDB';
// import {TRIAL_EXPIRES_SOON} from 'universal/utils/constants';
// import trimFields from 'server/__tests__/utils/trimFields';
// import fs from 'fs';

// stripe.subscriptions.update('sub_A9nq7dAOWGUKlD', {
//   trial_end: ~~((Date.now() + ms('5s')) / 1000)
// }, (err, res) => {
//   console.log('Sub result:', err, res);
// })

//   stripe.invoices.list({
//     customer
//   }, (err, invoices) => {
//     console.log('invoices result:', err, invoices);
//     const firstInvoiceId = invoices.data[0].id;
//     stripe.invoices.pay(firstInvoiceId, (err, invoice) => {
//       console.log('Payment result:', err, invoice)
//     })
//   })
// });

// stripe.invoices.retrieveLines('in_19pVJzFLaFINmHnBC5uwabBm', (err, invoice) => {
//   for (let i = 0; i < invoice.data.length; i++) {
//     const line = invoice.data[i];
// if (!line.period) {
// console.log(line);
// }
// }
// console.log('Payment result:', err, invoice.data)
// });

// const foo = async (resource, method, ...args) => {
//   console.log('args', args, ...args);
//   const res = await stripe[resource][method](...args);
//   console.log(res);
// };
// foo('invoices', 'retrieveLines', 'in_19pVJzFLaFINmHnBC5uwabBm');

// stripe.invoices.retrieve('upcoming', (err, res) => {
//   console.log(err, res, res.lines.data);
// });

// stripe.invoices.retrieveUpcoming('cus_AAUHCZYp65T4Tw', (err, res) => {
//   console.log(res)
// });
// import TrimSnapshot from 'server/__tests__/utils/TrimSnapshot';
// const now = new Date();
// async function foo() {
//   const mockDB = new MockDB();
//   const {user, organization} = await mockDB.init()
//     // .newNotification(undefined, {type: TRIAL_EXPIRED})
//     .org(0, {periodEnd: new Date(now.getTime() + 1)});
// fs.writeFile('./debug.json', JSON.stringify(organization), (err) => {
//   if (err) console.log(err);
// });
// }
// foo();
// const orgDoc = {
//   sources: {
//     data: [
//       {customer: 'foo'}
//     ]
//   }
// };
// debugger
// console.log(trimSnapshot(orgDoc, ['sources.data.customer']));
