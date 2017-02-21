import stripe from './stripe';
import ms from 'ms';

// stripe.subscriptions.update('sub_A9iMIKf6BLI8IN', {
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

stripe.invoices.pay('in_19pOxxFLaFINmHnBKj95QjvD', (err, invoice) => {
  console.log('Payment result:', err, invoice)
})

// stripe.invoices.retrieve('in_19pN1ZFLaFINmHnBv7IU9Vvy', (err, res) => {
//   console.log(err, res);
// })

// const foo = async() => {
//   const bar = await stripe.subscriptions.del('sub_A9h6WgXTlKkT7y')
//     .catch((e) => {
//       throw e
//       // console.log('ERR', e)
//       // throw new Error(e)
//     });
//   console.log('bar', bar)
// };
// foo();
