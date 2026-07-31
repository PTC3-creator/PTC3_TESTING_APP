const CACHE_NAME = 'cbm-ptc3-v1.5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './image_da12fe.png',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Cài đặt Service Worker và lưu cache tĩnh
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Đang lưu trữ tài nguyên Offline...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Xóa cache cũ khi có phiên bản mới (đổi tên CACHE_NAME)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Xóa cache cũ:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Chiến lược Caching: "Cache First, falling back to Network"
self.addEventListener('fetch', (event) => {
  // Bỏ qua các API call đồng bộ (như gọi lên Google Sheets)
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Nếu có trong cache thì trả về ngay (Dùng offline)
      if (cachedResponse) {
        return cachedResponse;
      }
      // Không có thì tải từ mạng
      return fetch(event.request);
    })
  );
});