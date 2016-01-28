import * as _ from 'lodash';

import { EVENT, MODEL, OPERATION, INSERT, UPDATE, DELETE }
  from '../../api/socketio/publish';


export const OPERATIONS = [ INSERT, UPDATE, DELETE ];

export class Subscriptions
{
  constructor() {
    /*
     * e.g. {
     *     todos: [                                              // model 0
     *       {                                                   // sub 0
     *         params: { id: 'deadbeef', status: 'active' },     // params
     *         actions: {                                        // actions
     *           'INSERT': '<INSERT_ACTION_TYPE>',
     *           'UPDATE': '<UPDATE_ACTION_TYPE>',
     *           'DELETE': '<DELETE_ACTION_TYPE>',
     *         }
     *       },
     *       { params: { }, actions: { } }                       // sub 1
     *     ],
     *     notes: [ ]                                            // model 1
     *   }
     */
    this.byModel = { };
  }

  exists(model, params) {
    return typeof this.lookup(model, params) !== 'undefined';
  }

  /*
   * Returns: { 'INSERT': '...', 'UPDATE': '...', 'DELETE': '...' }
   */
  lookup(model, params) {
    if (!(model in this.byModel)) { return undefined; }
    const idx = _.findIndex(this.byModel[model],
      (obj) => _.isEqual(obj.params, params));
    if ( idx === -1 ) { return undefined; }
    return this.byModel[model][idx].actions;
  }

  lookupActions(model, operation) {
    const actions = [ ];
    if (!(model in this.byModel)) {
      return actions;
    }
    const modelSubs = this.byModel[model];
    for (let idx = 0; idx < modelSubs.length; idx++) {
      if (!(operation in modelSubs[idx].actions)) {
        continue;
      }
      actions.push(modelSubs[idx].actions[operation]);
    }
    return actions;
  }

  add(model, params, actions) {
    if (this.exists(model, params)) {
      throw new Error('already exists');
    }
    if (!(model in this.byModel)) {
      this.byModel[model] = [ ];
    }
    this.byModel[model].push({ params: params, actions: actions });
  }

  remove(model, params) {
    if (!this.exists(model, params)) {
      throw new Error('does not exist');
    }
    const idx = _.findIndex(this.byModel[model],
      (obj) => _.isEqual(obj.params, params));
    this.byModel[model].splice(idx, 1);
    if (!this.byModel[model].length) {
      delete this.byModel[model];
    }
  }
}

class SubscriptionManager {
  constructor() {
    this.client = null;
    this.subscriptions = new Subscriptions();
  }

  // TODO: make asynchronous
  dispatchActions(payload, store) {
    // Check for valid operation:
    if (!(MODEL in payload)) {
      console.log('dispatchActions(): no model specified');
      return;
    }
    if (!(OPERATION in payload) && !(payload[OPERATION] in OPERATIONS)) {
      console.log('dispatchActions(): invalid operation');
      return;
    }
    const model = payload[MODEL];
    const operation = payload[OPERATION];
    const actionTypes = this.subscriptions.lookupActions(model, operation);
    const actions = _.map(actionTypes, (type) =>
      new Promise( (resolve, reject) => // eslint-disable-line no-unused-vars
        store.dispatch({ type: type, payload: payload })
      )
    );
    Promise.all(actions);
  }

  registerClient(client) {
    if (this.client) return;

    this.client = client;
    client.sm.addListener(EVENT, this.dispatchActions.bind(this));
  }

  async subscribe(client, modelPath, params, room, iudActions) {
    if (this.subscriptions.exists(modelPath, params)) {
      throw new Error('already exists');
    }

    // Take opportunity to register the ApiClient
    this.registerClient(client);

    // Call model subscription:
    await client.falcor
      .call(modelPath + '.subscribe',
        [ params, room ], // params
        [ ] // keys to fetch for any created refs
      );

    // Save subscription
    const [ actionInsert, actionUpdate, actionDelete ] = iudActions;
    const actions = {
      [INSERT]: actionInsert,
      [UPDATE]: actionUpdate,
      [DELETE]: actionDelete
    };
    this.subscriptions.add(modelPath, params, actions);
  }

  async unsubscribe(client, modelPath, params, room) {
    if (!this.subscriptions.exists(modelPath, params)) {
      throw new Error('does not exist');
    }

    // Call model unsubscribe:
    await client.falcor
      .call(modelPath + '.subscribe',
        [ params, room ], // params
        [ ] // keys to fetch for any created refs
      );

    // Remove subscription:
    this.subscription.remove(modelPath, params);
  }
}

export const subscriptionManager = new SubscriptionManager();
export default subscriptionManager;
