const WORKER_URL = 'worker.jjmax.workers.dev';
// const WORKER_URL = '127.0.0.1:8787';

const COOKIE_INFO = 'Domain=.jjmax.workers.dev; Secure; HttpOnly; SameSite=none; Expires=2147483647';
const CLIENT_SITE = 'https://jjmax75.github.io';
// const CLIENT_SITE = 'http://localhost:5000';

function checkCookies(request, names) {
  const cookies = request.headers.get('Cookie');
  if (!cookies) {
    return false;
  }

  for (let name of names) {
    if (!cookies.includes(`${name}=`)) {
      return false;
    }
    return true;
  };
};

function getCookie(request, name) {
  let result = '';
  const cookieString = request.headers.get('Cookie');
  if (cookieString) {
    const cookies = cookieString.split(';');
    cookies.forEach(cookie => {
      const cookiePair = cookie.split('=', 2);
      const cookieName = cookiePair[0].trim();
      if (cookieName === name) {
        const cookieVal = cookiePair[1];
        result = cookieVal;
      }
    })
  }
  return result;
}

function fetchVars() {
  return `
    console.log('fetching the vars');
    fetch('https://${WORKER_URL}/', {
      method: 'POST',
      body: JSON.stringify([name, quote]),
      credentials: 'include'
    }).then(response => {
      return response.text();
    }).then(ip => {
      console.log(ip);
    });
  `
};

async function handleRequest(request) {
  const cookiesPresent = checkCookies(request, ['name', 'quote']);
  
  if (cookiesPresent) {
    const name = getCookie(request, 'name');
    const quote = getCookie(request, 'quote');

    return new Response(`
      console.log('name: ${name}');
      console.log('quote: ${quote}');
      document.cookie = 'local_name=${name}';
      document.cookie = 'local_quote=${quote}';
    `, {
      headers: { 'Content-Type': 'application/javascript' },
    });
  } else {
    return new Response(fetchVars(), {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  }
};

async function handlePostRequest(request) {
  const ip = request.headers.get('CF-Connecting-IP');

  const [name, quote] = await request.json();

  const response = new Response(ip, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', CLIENT_SITE);
  response.headers.append('Set-Cookie', `name=${name}; ${COOKIE_INFO}`);
  response.headers.append('Set-Cookie', `quote=${quote}; ${COOKIE_INFO}`);
  response.bodyUsed = true;

  return response;
}

addEventListener('fetch', event => {
  const request = event.request;

  if (request.method.toUpperCase() === 'POST') {
    event.respondWith(handlePostRequest(request));
  } else {
    event.respondWith(handleRequest(request));
  }
})
