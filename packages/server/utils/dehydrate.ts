/**
 * WARNING: this function does no HTML, JS, or JSON escaping whatsoever.
 * `globalScopeName` and `data` must be verified to be safe before templating
 * the result of this function into an HTML document.
 *
 * Given a JS variable name `globalScopeName` and a JS value `data`, returns
 * a JS string which can be templated into a `<script>` element in order to
 * make data available to the client without requiring a request from within
 * the client app.
 */
const dehydrate = (globalScopeName: string, data: Record<string, any>) =>
  `window.${globalScopeName} = ${JSON.stringify(data)}`

export default dehydrate
