function checkCookies(request, names) {
  const cookies = request.headers.get('cookie');
  for (let name of names) {
    if (!cookies.includes(`${name}=`)) {
      return false;
    }
    return true;
  };
};

module.exports = checkCookies;
