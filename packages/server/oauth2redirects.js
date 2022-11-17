// this is deployed as a cloudflare worker at process.env.OAUTH2_REDIRECT

async function handleRequest(request) {
  const url = new URL(request.url)
  const {search, searchParams} = url
  const state = searchParams.get('state')
  let parsedState
  try {
    parsedState = JSON.parse(atob(state))
  } catch (e) {
    // nope
  }
  if (!parsedState || typeof parsedState !== 'object') {
    return new Response('No state received in response')
  }

  // can remove fallback in prod
  const {origin, service} = parsedState.origin
  const pathname = `auth/${service}`
  let destinationURL
  try {
    destinationURL = new URL(origin)
  } catch (e) {
    return new Response('Invalid origin provided in state')
  }
  destinationURL.pathname = pathname
  destinationURL.search = search
  const destinationStr = destinationURL.toString()
  return Response.redirect(destinationStr, 301)
}

export default {
  fetch: handleRequest
}
