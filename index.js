const config = {
  key: B2KeyID,
  secret: B2AppKey,
  bucket: B2BucketName
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

addEventListener("scheduled", event => {
  event.waitUntil(getB2Token(config));
})

const getB2Token = async (config) => {
  const { key, secret } = config;
  const res = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    headers: {
      'Authorization': 'Basic ' + btoa(B2KeyID + ":" + B2AppKey)
    }
  });
  const data = await res.json();
  await B2CDN.put('auth', data.authorizationToken);
};

async function serveAsset(event) {
  const url = new URL(event.request.url);
  const cache = caches.default;
  let response = await cache.match(event.request);

  if (!response) {
    const bucketUrl = 'https://f004.backblazeb2.com/file/' + config.bucket;
    const auth = await B2CDN.get('auth');
    response = await fetch(bucketUrl + url.pathname + '?Authorization=' + auth);
    const headers = {'cache-control': 'public, max-age=14400'};
    response = new Response(response.body, { ...response, headers });
    event.waitUntil(cache.put(event.request, response.clone()));
  }
  return response;
}

async function handleRequest(event) {
  if (event.request.method === 'GET') {
    let response = await serveAsset(event);
    if (response.status > 399) {
      response = new Response(response.statusText, { status: response.status });
    }
    return response;
  } else {
    return new Response('Method not allowed', { status: 405 });
  }
}
