var url = require('url');

function isEmptyString(val) {
  return typeof val === 'string' && !val.length;
}

module.exports = function parseUrl(gitUrl) {
  var obj = {};

  if (isEmptyString(gitUrl)) {
    return obj;
  }

  var parsed = url.parse(gitUrl);
  if (isEmptyString(parsed.path) || isEmptyString(parsed.pathname)) {
    return obj;
  }

  // donejs/donejs-travis.git
  var collect = function collect(fullname) {
    var parts = fullname.split('/').filter(Boolean);
    obj.owner = parts[0];
    obj.name = parts[1].replace('.git', '');
  };

  // https://github.com/donejs/donejs-travis.git
  if (parsed.protocol) {
    collect(parsed.pathname);
  } else {
    // git@github.com:donejs/donejs-travis.git
    var parts = parsed.pathname.split(':');
    if (parts.length === 2) {
      collect(parts[1]);
    } else {
      collect(parts[0]);
    }
  }

  return obj;
};
