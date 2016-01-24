import superagent from 'superagent';
import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
import config from '../../config/config';

const httpMethods = ['get', 'post', 'put', 'patch', 'del'];
const falcorModelName = 'model.json';

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

        if (data) {
          request.send(data);
        }

        request.end((err, { body } = {}) => err ? reject(body || err) : resolve(body));
      }));

    // Falcor methods are already promises, we can add here as object property:
    this.falcor = new falcor.Model(
      { source: new HttpDataSource(formatUrl(falcorModelName)) });
  }
}

const ApiClient = _ApiClient;

export default ApiClient;
