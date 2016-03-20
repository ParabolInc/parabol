import io from 'socket.io-client';
import * as _ from 'lodash';
import { connected, disconnected } from '../redux/modules/socket';

// TODO: secure with JWT

export default class SocketManager {
  constructor() {
    this.socket = null;
    this.store = { dispatch: (action) => action };
    this.listeners = { };
  }

  /*
   * event: string
   * handler: (payload, store) => ()
   */
  addListener(event, handler) {
    const { socket, store, listeners } = this;
    const fn = (payload) => handler(payload, store);

    if (event in listeners) {
      throw new Error(`already listening for ${event}`);
    }
    socket.on(event, fn);
    this.listeners[event] = fn;
  }

  removeListener(event) {
    const { socket, listeners } = this;
    if (!(event in listeners)) {
      throw new Error(`wasn't listening for ${event}`);
    }
    socket.removeListener(event, listeners[event]);
    delete listeners[event];
  }

  connect() {
    this.socket = io('', { path: '/ws' });
    this.addListener('connect',
      (payload, store) => store.dispatch(connected(this.socket.id)));
    this.addListener('disconnect',
      (payload, store) => store.dispatch(disconnected(this.socket.id)));
    // TODO: add error event

    // TODO: to be removed:
    this.socket.on('news', (data) => {
      console.log(data);
      this.socket.emit('my other event', { my: 'data from client' });
    });
    this.socket.on('msg', (data) => {
      console.log(data);
    });
  }

  emitAsync(event, payload) {
    const that = this;
    return new Promise(function emit(resolve, reject) {
      return that.socket.emit(event, payload, function cb() {
        const args = _.toArray(arguments);
        if (!args[0]) return reject(new Error(args[0]));
        return resolve.apply(null, args);
      });
    });
  }

  setStore(store) {
    this.store = store;
  }
}
