/* ==========================================================================
   さんすうアドベンチャー 1ねんせい  Service Worker
   いちど ひらけば、オフラインでも あそべるように ファイルを キャッシュします。

   ほうしん：
   ・ページ本体（index.html）… ネット優先 → こうしんが すぐ とどく。
     オフラインなら キャッシュから ひらく。
   ・アセット（/assets/ の JS/CSS は ハッシュつきで 中身が 変わらない）
     … キャッシュ優先 → 2回目からは 速い＆通信ゼロ。
   ・キャッシュの かたちを 変えたら CACHE の 番号を 上げる（古いのは 自動そうじ）。
   ========================================================================== */

const CACHE = 'sansuu-adventure-v1'

// さいしょに かならず キャッシュして おく ファイル（相対パス = このSWの場所基準）
const PRECACHE = [
  './',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './icon-64.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // ページ本体：ネット優先（オフラインなら キャッシュ）
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put('./', copy))
          return res
        })
        .catch(() => caches.match('./'))
    )
    return
  }

  // そのほか（JS/CSS/画像/フォント）：キャッシュ優先、なければ とってきて キャッシュ
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((cache) => cache.put(req, copy))
          }
          return res
        })
    )
  )
})
