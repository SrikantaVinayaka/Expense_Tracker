const CACHE_NAME = "expense-tracker-v2";
const ASSETS_TO_CACHE = [
  "/Expense_Tracker/",
  "/Expense_Tracker/index.html",
  "/Expense_Tracker/styles.css",
  "/Expense_Tracker/expenseTracker.js",
  "/Expense_Tracker/chart.js",
  "/Expense_Tracker/popup.js",
  "/Expense_Tracker/images/icon-192x192.png",
  "/Expense_Tracker/images/icon-512x512.png",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
