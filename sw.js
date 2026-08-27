self.addEventListener('fetch', function(event) {
  // ให้ระบบดึงข้อมูลแบบ network-first ตามปกติ
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
