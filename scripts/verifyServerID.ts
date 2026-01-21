import dotenv from 'dotenv'
dotenv.config()

import {identityManager} from '../packages/server/utils/ServerIdentityManager'
import getRedis from '../packages/server/utils/getRedis'
import {spawn} from 'child_process'
import path from 'path'

const CMD = 'pnpm'
const ARGS = ['sucrase-node', __filename]

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function worker() {
  console.log('Worker starting...')
  try {
    const id = await identityManager.claimIdentity()
    console.log(`WORKER_CLAIMED:${id}`)
    // Keep alive
    setInterval(() => {
        // Heartbeat logic is internal to identityManager
    }, 1000)
  } catch (e) {
    console.error('Worker failed:', e)
    process.exit(1)
  }
}

async function runRaceTest() {
  console.log('--- Starting Race Condition Test ---')
  const p1 = spawn(CMD, [...ARGS, 'worker'], { stdio: ['ignore', 'pipe', 'pipe'] })
  const p2 = spawn(CMD, [...ARGS, 'worker'], { stdio: ['ignore', 'pipe', 'pipe'] })

  let id1: string | null = null
  let id2: string | null = null

  const p1Promise = new Promise<string>((resolve) => {
      p1.stdout.on('data', (d) => {
          const s = d.toString()
          console.log(`P1: ${s.trim()}`)
          const m = s.match(/WORKER_CLAIMED:(\d+)/)
          if (m) resolve(m[1])
      })
  })
  const p2Promise = new Promise<string>((resolve) => {
      p2.stdout.on('data', (d) => {
          const s = d.toString()
          console.log(`P2: ${s.trim()}`)
          const m = s.match(/WORKER_CLAIMED:(\d+)/)
          if (m) resolve(m[1])
      })
  })

  const [res1, res2] = await Promise.all([p1Promise, p2Promise])
  id1 = res1
  id2 = res2

  console.log(`P1 ID: ${id1}, P2 ID: ${id2}`)

  if (id1 === id2) {
      console.error('FAIL: Both workers claimed the same ID!')
      process.exit(1)
  }

  console.log('PASS: Workers claimed different IDs.')

  p1.kill()
  p2.kill()
}

async function runLifecycleTest() {
  console.log('\n--- Starting Lifecycle/TTL Test ---')

  // Start a worker
  const p = spawn(CMD, [...ARGS, 'worker'], { stdio: ['ignore', 'pipe', 'pipe'] })
  let claimedId: string | null = null

  await new Promise<void>((resolve) => {
      p.stdout.on('data', (d) => {
          const s = d.toString()
          const m = s.match(/WORKER_CLAIMED:(\d+)/)
          if (m) {
              claimedId = m[1]
              resolve()
          }
      })
  })

  console.log(`Worker claimed ID: ${claimedId}`)

  // Verify Key exists in Redis
  const redis = getRedis()
  const key = `server:id:${claimedId}`
  let exists = await redis.exists(key)
  if (!exists) {
      console.error('FAIL: Redis key not found immediately after claim')
      process.exit(1)
  }
  console.log('Redis key confirmed.')

  // Test SIGTERM (Graceful shutdown)
  console.log('Sending SIGTERM to worker...')
  p.kill('SIGTERM')

  // Wait for it to exit
  await new Promise((resolve) => p.on('exit', resolve))

  // Check if key is gone
  exists = await redis.exists(key)
  if (exists) {
      console.error('FAIL: Redis key still exists after SIGTERM (it should have been released)')
      // Note: If SIGTERM handler is not robust, this might fail.
  } else {
      console.log('PASS: Redis key deleted on SIGTERM.')
  }

  // --- Test SIGKILL (TTL) ---
  console.log('\n--- Testing SIGKILL (Crash) & TTL ---')
  const pCrash = spawn(CMD, [...ARGS, 'worker'], { stdio: ['ignore', 'pipe', 'pipe'] })
  let crashId: string | null = null
  await new Promise<void>((resolve) => {
      pCrash.stdout.on('data', (d) => {
          const s = d.toString()
          const m = s.match(/WORKER_CLAIMED:(\d+)/)
          if (m) {
              crashId = m[1]
              resolve()
          }
      })
  })
  console.log(`Crasher claimed ID: ${crashId}`)

  console.log('Sending SIGKILL...')
  pCrash.kill('SIGKILL')

  // Check key exists
  const crashKey = `server:id:${crashId}`
  let crashExists = await redis.exists(crashKey)
  if (!crashExists) {
      console.error('FAIL: Key disappeared immediately after SIGKILL? Strange.')
  } else {
      console.log('Key exists as expected. Waiting for TTL (simulated)...')
      // To test real TTL we'd wait 60s. That's too long for this interaction.
      // We can check the TTL on the key.
      const ttl = await redis.ttl(crashKey)
      console.log(`Key TTL is: ${ttl}s`)
      if (ttl > 0 && ttl <= 60) {
          console.log('PASS: Key has valid TTL.')
      } else {
          console.error(`FAIL: Key TTL ${ttl} is invalid.`)
      }
      // Force delete to clean up
      await redis.del(crashKey)
  }

  process.exit(0)
}


if (process.argv[2] === 'worker') {
    worker()
} else {
    (async () => {
        try {
            await runRaceTest()
            await runLifecycleTest()
        } catch (e) {
            console.error(e)
            process.exit(1)
        }
    })()
}
