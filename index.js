function checkCookies(request, names) {
  const cookies = request.headers.get('cookie');
  console.log(cookies);
  for (let name of names) {
    if (!cookies.includes(`${name}=`)) {
      return false;
    }
    return true;
  };
};

async function handleRequest(request) {
  const cookiesPresent = checkCookies(request, ['name', 'quote']);
  console.log(cookiesPresent);
  return new Response('Hello worker!', {
    headers: { 'content-type': 'text/plain' },
  })
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
