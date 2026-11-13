// uWebSockets closes an idle keep-alive connection after about 10 seconds, but Google's load balancer reuses one for up
// to 10 minutes, so now and then it answers the request for the script with a 503. Registering again fetches it again
const registerServiceWorker = () => {
  const register = () => navigator.serviceWorker.register('/sw.js', {scope: '/'})
  // logging from a closure keeps a frame of the app's own beneath console.error, which tells it from an extension's log
  return register()
    .catch(register)
    .catch((error) => console.error(error))
}

export default registerServiceWorker
