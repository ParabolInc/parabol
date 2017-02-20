import stripe from './stripe';
import ms from 'ms';
stripe.subscriptions.update('sub_A9daL6FMKb0W7e', {
  trial_end: ~~((Date.now() + ms('5s')) / 1000)
}, (err, res) => console.log('res', res));
