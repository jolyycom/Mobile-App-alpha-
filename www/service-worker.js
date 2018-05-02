self.addEventListener('activate', function (event) {
    console.log('activate event triggered');
});

self.addEventListener('fetch', function (event) {
    console.log('fetch event triggered');
});

self.addEventListener('push', function (event) {
    console.log('push event triggered');
});