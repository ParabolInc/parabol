/*
  Prints dev/stack.json, which says where this checkout's dev stack is served & whether it is ready
  Exits with 0 when the stack is ready, 1 when it is not running & 2 when it is still starting
  --wait blocks until the stack is ready or gone, e.g. `pnpm dev:status --wait && run-my-check`
*/
import readStack from './devStack/readStack.mts'

const POLL_MS = 100

const devStatus = async () => {
  const isWaiting = process.argv.includes('--wait')
  let stack = readStack()
  while (isWaiting && stack && !stack.ready) {
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
    stack = readStack()
  }
  if (!stack) {
    console.error('The dev stack is not running. Start it with `pnpm dev`')
    process.exit(1)
  }
  console.log(JSON.stringify(stack, null, 2))
  process.exit(stack.ready ? 0 : 2)
}

devStatus()
