import * as _ from 'lodash';

export class Subscriptions
{
  constructor() {
    /*
     * e.g. {
     *     todos: [                                              // model 0
     *       {                                                   // sub 0
     *         params: { id: 'deadbeef', status: 'active' },     // params
     *         cursor: Object                                    // cursor
     *         rooms: [ '...', ]                                 // rooms
     *       },
     *       { params: { }, cursor: Object }                     // sub 1
     *     ],
     *     notes: [ ... ]                                        // model 1
     *   }
     */
    this.byModel = { };
  }

  _findIndexByParams(model, params) {
    return _.findIndex(this.byModel[model],
      (obj) => _.isEqual(obj.params, params)
    );
  }

  exists(model, params) {
    return typeof this.lookup(model, params) !== 'undefined';
  }

  /*
   * Returns: Cursor object
   */
  lookup(model, params) {
    if (!(model in this.byModel)) { return undefined; }
    const idx = this._findIndexByParams(model, params);
    if ( idx === -1 ) { return undefined; }
    return this.byModel[model][idx].cursor;
  }

  add(model, params, cursor) {
    if (this.exists(model, params)) {
      throw new Error('already exists');
    }
    if (!(model in this.byModel)) {
      this.byModel[model] = [ ];
    }
    this.byModel[model].push({ params: params, cursor: cursor });
  }

  remove(model, params) {
    if (!this.exists(model, params)) {
      throw new Error('does not exist');
    }
    const idx = this._findIndexByParams(model, params);
    this.byModel[model].splice(idx, 1);
    if (!this.byModel[model].length) {
      delete this.byModel[model];
    }
  }

  getRoomsFor(model, params) {
    if (!this.exists(model, params)) {
      throw new Error('subscription does not exist');
    }
    const idx = this._findIndexByParams(model, params);
    return _.get(this.byModel, `${model}[${idx}].rooms`);
  }

  addRoomTo(model, params, room) {
    if (!this.exists(model, params)) {
      throw new Error('subscription does not exist');
    }
    const idx = this._findIndexByParams(model, params);
    _.set(this.byModel, `${model}[${idx}].rooms`,
      _.union(this.getRoomsFor(model, params), [room])
    );
    return this.getRoomsFor(model, params);
  }

  removeRoomFrom(model, params, room) {
    if (!this.exists(model, params)) {
      throw new Error('subscription does not exist');
    }
    const idx = this._findIndexByParams(model, params);
    _.set(this.byModel, `${model}[${idx}].rooms`,
      _.difference(this.getRoomsFor(model, params), [room])
    );
    return this.getRoomsFor(model, params);
  }

}

export const subscriptions = new Subscriptions();
export default subscriptions;
