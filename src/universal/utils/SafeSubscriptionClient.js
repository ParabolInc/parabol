import {GQL_CONNECTION_KEEP_ALIVE, WS_KEEP_ALIVE} from 'universal/utils/constants';
import {GRAPHQL_WS} from 'subscriptions-transport-ws/dist/protocol';
import {SubscriptionClient} from 'subscriptions-transport-ws/dist/index';

export default class SafeSubscriptionClient extends SubscriptionClient {
  keepAlive(timeout) {
    this.client.send(GQL_CONNECTION_KEEP_ALIVE);
    if (this.cancelKeepAlive) {
      clearInterval(this.cancelKeepAlive);
    } else {
      this.cancelKeepAlive = setInterval(() => {
        this.close(false, true);
      }, 2 * timeout);
    }
  }

  connect() {
    this.client = new WebSocket(this.url, GRAPHQL_WS);
    this.checkMaxConnectTimeout();

    // monkey patched to catch aggressive firewalls that block websockets
    this.client.onerror = (e) => {
      // if reconnecting, then websockets aren't blocked
      if (this.reconnecting) return;
      this.eventEmitter.emit('socketsDisabled', e.message);
      this.reconnect = false;
    };

    // monkey patched to avoid sending an INIT
    this.client.onopen = () => {
      this.clearMaxConnectTimeout();
      this.closedByUser = false;
      this.eventEmitter.emit(this.reconnecting ? 'reconnecting' : 'connecting');
      this.flushUnsentMessagesQueue();
    };

    // monkey patched to use your own keep alive
    this.client.onmessage = ({data}) => {
      if (data === GQL_CONNECTION_KEEP_ALIVE) {
        this.keepAlive(WS_KEEP_ALIVE);
      } else {
        this.processReceivedData(data);
      }
    };

    // monkey patched to clean up our keep alive
    this.client.onclose = () => {
      if (!this.closedByUser) {
        this.close(false, false);
      }
      clearInterval(this.cancelKeepAlive);
      this.cancelKeepAlive = undefined;
    };
  }
}
