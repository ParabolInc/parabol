import { expect } from 'chai';
import { Subscriptions } from '../subscriptionManager';
import { INSERT, UPDATE, DELETE } from '../../../api/socketio/publish';

const insertFn = () => 'insert';
const updateFn = () => 'update';
const updateFn2 = () => 'update2';
const deleteFn = () => 'delete';

describe('Subscriptions', () => {
  it('verifies Subscriptions exist', () => {
    expect(Subscriptions).to.exist;
  });

  it('verifies Subscriptions constructor', () => {
    const subs = new Subscriptions();
    expect(subs).to.exist;
  });

  it('verifies Subscriptions add 1', () => {
    const subs = new Subscriptions();
    const params = { id: 0 };
    const actions = {
      [INSERT]: insertFn,
      [UPDATE]: updateFn,
      [DELETE]: deleteFn
    };
    subs.add('test', params, actions);
    expect(subs.exists('test', params)).to.be.true;
  });

  it('verifies Subscriptions throws on double add', () => {
    const subs = new Subscriptions();
    const params = { id: 0 };
    const actions = {
      [INSERT]: insertFn,
      [UPDATE]: updateFn,
      [DELETE]: deleteFn
    };
    subs.add('test', params, actions);
    expect(
      () => subs.add('test', params, actions)
    ).to.throw(Error);
  });

  it('Subscriptions lookup 1', () => {
    const subs = new Subscriptions();
    const params = { id: 0 };
    const actions = {
      [INSERT]: insertFn,
      [UPDATE]: updateFn,
      [DELETE]: deleteFn
    };
    subs.add('test', params, actions);
    expect(
      subs.lookup('test', params)
    ).to.deep.equal(actions);
  });

  it('Subscriptions lookup actions 1', () => {
    const subs = new Subscriptions();
    const params = { id: 0 };
    const actions = {
      [INSERT]: insertFn,
      [UPDATE]: updateFn,
      [DELETE]: deleteFn
    };
    subs.add('test', params, actions);
    expect(
      subs.lookupActions('test', INSERT)[0]
    ).to.equal(actions[INSERT]);
  });

  it('Subscriptions add 2', () => {
    const subs = new Subscriptions();
    const params = [ { id: 0 }, { id: 1 } ];
    const actions = [
      {
        [INSERT]: insertFn,
        [UPDATE]: updateFn,
        [DELETE]: deleteFn
      },
      {
        [INSERT]: insertFn,
        [UPDATE]: updateFn2,
        [DELETE]: deleteFn
      }
    ];
    subs.add('test', params[0], actions[0]);
    subs.add('test', params[1], actions[1]);
    expect(subs.exists('test', params[0])).to.be.true;
    expect(subs.exists('test', params[1])).to.be.true;
  });

  it('Subscriptions add 1, 2 doesn\'t exist', () => {
    const subs = new Subscriptions();
    const params = [ { id: 0 }, { id: 1 } ];
    const actions = [
      {
        [INSERT]: insertFn,
        [UPDATE]: updateFn,
        [DELETE]: deleteFn
      },
      {
        [INSERT]: insertFn,
        [UPDATE]: updateFn2,
        [DELETE]: deleteFn
      }
    ];
    subs.add('test', params[0], actions[0]);
    expect(subs.exists('test', params[0])).to.be.true;
    expect(subs.exists('test', params[1])).to.be.false;
  });

  it('Subscriptions lookup 2 actions', () => {
    const subs = new Subscriptions();
    const params = [ { id: 0 }, { id: 1 } ];
    const actions = [
      {
        [INSERT]: insertFn,
        [UPDATE]: updateFn,
        [DELETE]: deleteFn
      },
      {
        [INSERT]: insertFn,
        [UPDATE]: updateFn2,
        [DELETE]: deleteFn
      }
    ];
    subs.add('test', params[0], actions[0]);
    subs.add('test', params[1], actions[1]);
    expect( subs.lookupActions('test', UPDATE) )
      .to.be.deep.equals( [updateFn, updateFn2] );
  });

  it('Subscriptions remove 1', () => {
    const subs = new Subscriptions();
    const params = [ { id: 0 }, { id: 1 } ];
    const actions = [
      {
        [INSERT]: insertFn,
        [UPDATE]: updateFn,
        [DELETE]: deleteFn
      },
      {
        [INSERT]: insertFn,
        [UPDATE]: updateFn2,
        [DELETE]: deleteFn
      }
    ];
    subs.add('test', params[0], actions[0]);
    subs.remove('test', params[0]);
    expect( subs.exists('test', params[0]) ).to.be.false;
    expect(
      () => subs.remove('test', params[0])
    ).to.throw(Error);
  });

  it('Subscriptions remove 1 of 2', () => {
    const subs = new Subscriptions();
    const params = [ { id: 0 }, { id: 1 } ];
    const actions = [
      {
        [INSERT]: insertFn,
        [UPDATE]: updateFn,
        [DELETE]: deleteFn
      },
      {
        [INSERT]: insertFn,
        [UPDATE]: updateFn2,
        [DELETE]: deleteFn
      }
    ];
    subs.add('test', params[0], actions[0]);
    subs.add('test', params[1], actions[1]);
    subs.remove('test', params[0]);
    expect( subs.exists('test', params[0]) ).to.be.false;
    expect(
      () => subs.remove('test', params[0])
    ).to.throw(Error);
  });
});
