// import shortid from 'shortid';
//
// import stripe from '../../billing/stripe';
// import {toEpochSeconds} from '../../utils/epochTime';
//
//
// class Customers {
//   constructor() {
//     this.customers = {};
//   }
//   toString() {
//     return `${this.customers}`;
//   }
//   create(options) {
//     const id = `cust_${shortid.generate()}`;
//     const sourceId = `card_${shortid.generate()}`;
//     const {metadata} = options;
//     const newCustomer = {
//       id,
//       object: 'customer',
//       created: toEpochSeconds(new Date()),
//       currency: null,
//       default_source: sourceId,
//       delinquent: false,
//       description: null,
//       discount: null,
//       email: null,
//       livemode: false,
//       metadata,
//       shipping: null,
//       sources: {
//         object: 'list',
//         data: [
//           {
//             id: sourceId,
//             object: 'card',
//             address_city: null,
//             address_country: null,
//             address_line1: null,
//             address_line1_check: null,
//             address_line2: null,
//             address_state: null,
//             address_zip: '3500',
//             address_zip_check: 'pass',
//             brand: 'Visa',
//             country: 'US',
//             customer: id,
//             cvc_check: 'pass',
//             dynamic_last4: null,
//             exp_month: 10,
//             exp_year: 2019,
//             funding: 'credit',
//             last4: '4242',
//             metadata: {
//             },
//             name: 'mm@iserve.dk',
//             tokenization_method: null
//           }
//         ],
//         has_more: false,
//         total_count: 0,
//         url: `/v1/customers/${id}/sources`
//       },
//       subscriptions: {
//         object: 'list',
//         data: [],
//         has_more: false,
//         total_count: 0,
//         url: `/v1/customers/${id}/subscriptions`
//       }
//     };
//     this.customers[id] = newCustomer;
//
//     return newCustomer;
//   }
//   get(id) {
//     return this.customers[id];
//   }
//   update(id) {
//     return this.customers[id];
//   }
// }
//
// const customers = new Customers();
//
// export function mockStripeCustomersCreate() {
//   stripe.customers.create = jest.fn((options) => {
//     return customers.create(options);
//   });
//
//   return stripe.customers.create;
// }
//
// export function mockStripeCustomersUpdate() {
//   stripe.customers.update = jest.fn((stripeId, options) => {
//     return customers.update(stripeId, options);
//   });
//
//   return stripe.customers.update;
// }
//
// export function mockStripeSubscriptionsCreate() {
//   stripe.subscriptions.create = jest.fn(() => {
//     const stripeSubscriptionId = `sub_${shortid.generate()}`;
//     const PERIOD_LENGTH = 2592000;
//     const now = toEpochSeconds(new Date());
//     return {
//       stripeSubscriptionId,
//       current_period_start: now,
//       current_period_end: now + PERIOD_LENGTH
//     };
//   });
//
//   return stripe.subscriptions.create;
// }
//
// export function mockStripeSubscriptionsUpdate() {
//   stripe.subscriptions.update = jest.fn(() => true);
//   return stripe.subscriptions.update;
// }
