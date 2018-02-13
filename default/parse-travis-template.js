var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

module.exports = function parseTravisTemplate() {
  return yaml.safeLoad(
    fs.readFileSync(path.join(__dirname, 'templates', 'travis.yml'), 'utf8')
  );
};
