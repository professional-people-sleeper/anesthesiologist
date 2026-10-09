// 👈 เปลี่ยนชื่อ/เลขเวอร์ชันตรงนี้ "ทุกครั้ง" ที่มีการแก้ไขไฟล์ index.html ในอนาคต
const CACHE_NAME = 'anes-app-v2'; 

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. ตอนติดตั้ง ให้ดึงไฟล์ไปเก็บในแคช และบังคับใช้ทันที
self.addEventListener('install', event => {
  self.skipWaiting(); // บังคับให้ Service Worker ตัวใหม่ทำงานทันทีโดยไม่ต้องรอผู้ใช้ปิดแอป
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. ตอนเริ่มทำงาน ให้เช็คเวอร์ชัน ถ้าเลขไม่ตรงกับ CACHE_NAME ปัจจุบัน ให้ลบของเก่าทิ้ง
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('ลบแคชเวอร์ชันเก่า: ', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. ตอนดึงข้อมูล (Fetch) ให้พยายามดึงจากเน็ตก่อน (Network First) ถ้าเน็ตหลุดค่อยดึงจากแคช
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ถ้าโหลดจากเน็ตสำเร็จ ให้เอาไปอัปเดตแคชด้วย
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // ถ้าไม่มีเน็ต ค่อยกลับไปหาในแคช
        return caches.match(event.request);
      })
  );
});
