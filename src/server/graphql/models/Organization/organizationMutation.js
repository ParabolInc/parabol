import getRethink from 'server/database/rethinkDriver';
import {UpdateOrgInput} from './organizationSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireOrgLeader, requireWebsocket} from '../authorization';
import updateOrgSchema from 'universal/validation/updateOrgSchema';
import {handleSchemaErrors} from '../utils';
import stripe from 'server/utils/stripe';
import {TRIAL_EXTENSION} from 'server/utils/serverConstants';
import {TRIAL_EXPIRES_SOON} from 'universal/utils/constants';
export default {
  updateOrg: {
    type: GraphQLBoolean,
    description: 'Update an with a change in name, avatar',
    args: {
      updatedOrg: {
        type: new GraphQLNonNull(UpdateOrgInput),
        description: 'the updated org including the id, and at least one other field'
      }
    },
    async resolve(source, {updatedOrg}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      await requireOrgLeader(authToken, updatedOrg.id);

      // VALIDATION
      const schema = updateOrgSchema();
      const {errors, data: {id: orgId, ...org}} = schema(updatedOrg);
      handleSchemaErrors(errors);

      // RESOLUTION
      const now = new Date();
      const newAction = {
        ...org,
        updatedAt: now
      };
      await r.table('Organization').get(orgId).update(newAction);
      return true;
    }
  },
  removeBillingLeader: {
    type: GraphQLBoolean,
    description: 'Remove a billing leader from an org',
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the org to remove the billing leader from'
      },
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The billing leader userId to remove from the org'
      }
    },
    async resolve(source, {orgId, userId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      await requireOrgLeader(authToken, orgId);

      // RESOLUTION
      const now = new Date();
      await r.table('User').get(orgId)
        .update((user) => {
          return user.merge({
            billingLeaderOrgs: user('billingLeaderOrgs').filter((id) => id.ne(orgId)),
            updatedAt: now
          });
        });
      return true;
    }
  },
  addBilling: {
    type: GraphQLBoolean,
    description: 'Add a credit card by passing in a stripe token encoded with all the billing details',
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the org requesting the changed billing'
      },
      stripeToken: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The token that came back from stripe'
      }
    },
    async resolve(source, {orgId, stripeToken}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      const userId = await requireOrgLeader(authToken, orgId);

      // RESOLUTION
      const now = new Date();
      const stripeRequests = [
        stripe.customers.create({
          metadata: {
            orgId
          },
          source: stripeToken
        }),
        stripe.tokens.retrieve(stripeToken)
      ];

      const [customer, token] = await Promise.all(stripeRequests);
      const {id: stripeId} = customer;
      const {brand, last4, exp_month: expMonth, exp_year: expYear} = token.card;
      const expiry = `${expMonth}/${expYear.substr(2)}`;
      const {isTrial, validUntil} = await r.table('Organization')
        .get(orgId)
        .pluck('isTrial', 'validUntil');

      const nowValidUntil = (isTrial && validUntil > now) ?
        new Date(validUntil.valueOf() + TRIAL_EXTENSION) :
        validUntil;

      await r.table('Organization').get(orgId)
        .update({
          creditCard: {
            brand,
            last4,
            expiry
          },
          stripeId,
          validUntil: nowValidUntil
        });


      if (validUntil !== nowValidUntil) {
        await r.table('User').get(userId)
          .update({
            // not too useful (only used as a boolean) but good to keep it matching what's in the org
            validUntil: nowValidUntil
          })
          .do(() => {
            return r.table('Notification')
              .getAll(orgId, {index: 'orgId'})
              .filter({
                type: TRIAL_EXPIRES_SOON
              })
              .delete()
          })
      }
    }
  }
};
