import type {HttpRequest, HttpResponse} from 'uWebSockets.js'

// Minimal relay page: receives the auth code from Parabol's authorize endpoint and
// sends it back to the Mattermost plugin via postMessage, then closes.
// targetOrigin '*' is intentional — the opener is Mattermost (a different origin).
// Security is preserved by state verification in the plugin + PKCE binding.
const HTML = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
(function(){
  var p=new URLSearchParams(window.location.search);
  var code=p.get('code'),state=p.get('state');
  if(window.opener&&code&&state)window.opener.postMessage({code:code,state:state},'*');
  window.close();
})();
</script></body></html>`

const mattermostCallbackHandler = (res: HttpResponse, _req: HttpRequest) => {
  res
    .writeStatus('200 OK')
    .writeHeader('Content-Type', 'text/html; charset=utf-8')
    .writeHeader('X-Content-Type-Options', 'nosniff')
    .end(HTML)
}

export default mattermostCallbackHandler
