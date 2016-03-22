import superagent from 'superagent';
import cookie from 'react-cookie';
import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
import SocketManager from './SocketManager';
import config from '../../config/config';

const httpMethods = ['get', 'post', 'put', 'patch', 'del'];
const falcorModelName = 'model.json';
const tokenCookieName = 'authorization';

function formatUrl(path) {
  const adjustedPath = path[0] !== '/' ? '/' + path : path;
  if (__SERVER__) {
    // Prepend host and port of the API server to the path.
    return 'http://' + config.apiHost + ':' + config.apiPort + adjustedPath;
  }
  // Prepend `/api` to relative URL, to proxy to API server.
  return '/api' + adjustedPath;
}

/*
 * This silly underscore is here to avoid a mysterious "ReferenceError: ApiClient is not defined" error.
 * See Issue #14. https://github.com/erikras/react-redux-universal-hot-example/issues/14
 *
 * Remove it at your own risk.
 */
class _ApiClient {
  constructor(req) {
    this.token = null;
    if (cookie && cookie.load(tokenCookieName)) {
      this.token = cookie.load(tokenCookieName).token;
    }
    this.http = {};
    httpMethods.forEach((method) =>
      this.http[method] = (path, { params, data } = {}) => new Promise((resolve, reject) => {
        const request = superagent[method](formatUrl(path));

        if (params) {
          request.query(params);
        }

        if (__SERVER__ && req.get('cookie')) {
          request.set('cookie', req.get('cookie'));
        }

        if (this.token !== null) {
          request.set(tokenCookieName, 'Bearer ' + this.token);
        }

        if (data) {
          request.send(data);
        }

        request.end((err, { body } = {}) => err ? reject(body || err) : resolve(body));
      }));

    // Falcor client, N.B. API is promised-based so we add as a property:
    this.falcor = this.falcorFactory();

    // WebSockets:
    this.sm = new SocketManager();
  }

  // Method for propagating the redux store to the SocketManager:
  setStore(store) {
    this.sm.setStore(store);
  }

  // Method for updating JWT token:
  updateToken(token) {
    this.token = token;
    cookie.save(tokenCookieName, { token: token });

    // Recreate falcor client:
    this.falcor = this.falcorFactory();

    // TODO: propagate token update to socket manager
  }

  falcorFactory() {
    if (this.token !== null) {
      const jwtSource = {
        source: new HttpDataSource(formatUrl(falcorModelName), {
          headers: { 'Authorization': 'Bearer ' + this.token }
        })
      };
      return new falcor.Model(jwtSource);
    }

    const anonSource = {
      source: new HttpDataSource(formatUrl(falcorModelName))
    };
    return new falcor.Model(anonSource);
  }
}

const ApiClient = _ApiClient;

export default ApiClient;
