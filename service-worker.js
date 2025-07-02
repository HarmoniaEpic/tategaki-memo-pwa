/**
 * Service Worker for 縦書きメモアプリ v1.8.0
 * Cache First戦略による完全オフライン対応
 */

const CACHE_NAME = 'tategaki-memo-v1.8.0';
const DYNAMIC_CACHE_NAME = 'tategaki-memo-dynamic-v1.8.0';

// キャッシュするリソースのリスト
const STATIC_CACHE_URLS = [
  '/tategaki-memo-pwa/',
  '/tategaki-memo-pwa/index.html',
  '/tategaki-memo-pwa/manifest.json',
  '/tategaki-memo-pwa/offline.html',
  // Google Fonts
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;600&family=Klee+One:wght@400;600&display=swap',
  // アイコン
  '/tategaki-memo-pwa/icons/icon-192x192.png',
  '/tategaki-memo-pwa/icons/icon-512x512.png'
];

// インストールイベント
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v1.8.0');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // 即座に有効化
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// アクティベートイベント
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v1.8.0');
  
  event.waitUntil(
    // 古いキャッシュの削除
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('tategaki-memo-') && 
                   cacheName !== CACHE_NAME && 
                   cacheName !== DYNAMIC_CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // すべてのクライアントを即座に制御
      return self.clients.claim();
    })
  );
});

// フェッチイベント（Cache First戦略）
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 同一オリジンのリクエストのみ処理
  if (url.origin !== location.origin && 
      !url.origin.includes('fonts.googleapis.com') && 
      !url.origin.includes('fonts.gstatic.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // キャッシュがあればそれを返す
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url);
          
          // バックグラウンドでキャッシュを更新（stale-while-revalidate）
          if (isStaticResource(request.url)) {
            updateCache(request);
          }
          
          return cachedResponse;
        }
        
        // キャッシュになければネットワークから取得
        console.log('[SW] Fetching from network:', request.url);
        return fetch(request)
          .then((networkResponse) => {
            // レスポンスが正常な場合はキャッシュに保存
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            
            return networkResponse;
          })
          .catch((error) => {
            console.error('[SW] Network request failed:', error);
            
            // オフライン時の処理
            if (request.destination === 'document') {
              return caches.match('/tategaki-memo-pwa/offline.html');
            }
            
            // 画像の場合はプレースホルダーを返すなど
            return new Response('オフラインです', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain; charset=utf-8'
              })
            });
          });
      })
  );
});

// メッセージイベント（クライアントとの通信）
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '1.8.0' });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// バックグラウンド同期イベント（フェーズ2）
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-saved-files') {
    event.waitUntil(syncSavedFiles());
  }
});

// プッシュ通知イベント（フェーズ2 - 将来的な実装用）
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : '新しい通知があります',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'tategaki-memo-notification'
  };
  
  event.waitUntil(
    self.registration.showNotification('縦書きメモ', options)
  );
});

// ヘルパー関数

// 静的リソースかどうかを判定
function isStaticResource(url) {
  return STATIC_CACHE_URLS.some(staticUrl => url.includes(staticUrl));
}

// バックグラウンドでキャッシュを更新
function updateCache(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        return caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(request, response);
          });
      }
    })
    .catch((error) => {
      console.log('[SW] Background update failed:', error);
    });
}

// 保存されたファイルの同期（フェーズ2）
async function syncSavedFiles() {
  // IndexedDBなどから保存されたファイルを取得して同期
  // 実装は後のフェーズで詳細化
  console.log('[SW] Syncing saved files...');
  return Promise.resolve();
}

// キャッシュストレージの使用量を監視
async function getCacheStorageInfo() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const percentUsed = (estimate.usage / estimate.quota) * 100;
    console.log(`[SW] Storage used: ${percentUsed.toFixed(2)}%`);
    return estimate;
  }
  return null;
}