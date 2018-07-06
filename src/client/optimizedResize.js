// testing this on chrome 66, i can't seem to see where it saves any cycles
let running = false
const cb = () => {
  if (running) {
    console.log('already running')
    return
  }
  running = true
  window.requestAnimationFrame(() => {
    window.dispatchEvent(new window.CustomEvent('optimizedResize'))
    running = false
  })
}
window.addEventListener('resize', cb)
