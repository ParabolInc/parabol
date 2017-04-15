import setToken from './setToken';

export default function (exchange) {
  return async (req, res) => {
    // close the oauth popup window. i'm just winging this. seems to work.
    const autoClose = `<!DOCTYPE html>
    <html>
    <head>
    <script>
      (window.close())()
    </script>
    </head>
    </html>
    `;
    res.send(autoClose);
    const {params: {service}, query} = req;
    const integrate = setToken[service];
    if (integrate) {
      integrate(query, exchange);
    }
  };
}
