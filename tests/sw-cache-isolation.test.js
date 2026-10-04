import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

const workerSource = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8')
const currentCache = 'sansuu-adventure-v1'
const appUrl = 'https://metaborin.github.io/sansuu-adventure/'

function loadWorker(names, source = workerSource) {
  const listeners = new Map()
  const storage = new Map(names.map((name) => [name, new Map()]))
  const deleted = []
  let claims = 0
  let networkRequests = 0
  const requestKey = (request) =>
    new URL(typeof request === 'string' ? request : request.url, appUrl).href

  runInNewContext(source, {
    URL,
    self: {
      location: new URL(appUrl),
      addEventListener: (name, callback) => listeners.set(name, callback),
      clients: { claim: async () => { claims += 1 } },
    },
    caches: {
      keys: async () => [...storage.keys()],
      delete: async (name) => {
        deleted.push(name)
        return storage.delete(name)
      },
      match: async (request) => {
        for (const entries of storage.values()) {
          const response = entries.get(requestKey(request))
          if (response) return response
        }
      },
    },
    fetch: async () => {
      networkRequests += 1
      throw new Error('Offline')
    },
  })

  return {
    storage,
    deleted,
    claims: () => claims,
    networkRequests: () => networkRequests,
    async activate() {
      let completion
      listeners.get('activate')({ waitUntil: (promise) => { completion = promise } })
      expect(completion).toBeDefined()
      await completion
    },
    async fetch(request) {
      let response
      listeners.get('fetch')({ request, respondWith: (promise) => { response = promise } })
      expect(response).toBeDefined()
      return response
    },
  }
}

describe('Service Worker cache ownership', () => {
  it('preserves the current cache, other apps, and unverified similar or future names', async () => {
    const names = [
      currentCache,
      'manabi-monsters-v0.7.5',
      'another-app-cache',
      'sansuu-adventure-v0',
      'sansuu-adventure-v2',
      'sansuu-adventure-v1-backup',
      'sansuu-adventure-v10',
      'prefix-sansuu-adventure-v1',
      'metaborin/sansuu-adventure/v1',
    ]
    const worker = loadWorker(names)
    for (const [name, entries] of worker.storage) entries.set('sentinel', name)

    await worker.activate()

    expect([...worker.storage.keys()]).toEqual(names)
    for (const [name, entries] of worker.storage) expect(entries.get('sentinel')).toBe(name)
    expect(worker.deleted).toEqual([])
    expect(worker.claims()).toBe(1)
  })

  it('keeps previously cached page and runtime assets usable while offline after activation', async () => {
    const worker = loadWorker([currentCache])
    const page = { body: 'saved page' }
    const script = { body: 'saved runtime script' }
    worker.storage.get(currentCache).set(appUrl, page)
    worker.storage.get(currentCache).set(`${appUrl}assets/existing.js`, script)

    await worker.activate()

    expect(await worker.fetch({ method: 'GET', mode: 'navigate', url: appUrl })).toBe(page)
    expect(await worker.fetch({ method: 'GET', mode: 'cors', url: `${appUrl}assets/existing.js` })).toBe(script)
    expect(worker.networkRequests()).toBe(1)
    expect(worker.deleted).toEqual([])
  })

  it('deletes only the recorded owned name when a future version retires that cache', async () => {
    // No obsolete own name exists in today's history. Simulate a future CACHE bump
    // while retaining the real v1 name in the allowlist, as the maintenance comment requires.
    const nextSource = workerSource.replace(
      "const CACHE = 'sansuu-adventure-v1'",
      "const CACHE = 'sansuu-adventure-v2'"
    )
    expect(nextSource).not.toBe(workerSource)
    const survivors = ['sansuu-adventure-v2', 'sansuu-adventure-v3', 'sansuu-adventure-v1-backup', 'another-app']
    const worker = loadWorker([currentCache, ...survivors], nextSource)

    await worker.activate()

    expect(worker.deleted).toEqual([currentCache])
    expect([...worker.storage.keys()]).toEqual(survivors)
    expect(worker.claims()).toBe(1)
  })
})
