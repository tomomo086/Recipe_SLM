const CACHE_NAME = 'recipe-ai-v1';
const urlsToCache = [
  './',
  './chat.html',
  './script.js',
  './styles.css',
  './manifest.json',
  './icon.svg'
];

// インストール時にキャッシュを作成
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ時にキャッシュから取得を試行
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュに存在する場合はキャッシュから返す
        if (response) {
          return response;
        }
        
        // キャッシュにない場合はネットワークから取得
        return fetch(event.request)
          .then(response => {
            // 成功した場合のみキャッシュに保存
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // オフライン時のフォールバック
            if (event.request.destination === 'document') {
              return caches.match('./chat.html');
            }
          });
      })
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
