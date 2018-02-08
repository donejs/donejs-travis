var assert = require('assert');
var parseUrl = require('../default/parse-git-url');

describe('parseGitUrl', function() {
  it('with empty string', function() {
    var parsed = parseUrl('');
    assert.deepEqual(parsed, {}, 'returns empty object');
  });

  it('works with local urls', function() {
    var parsed = parseUrl('/srv/project.git');
    assert.equal(parsed.owner, 'srv');
    assert.equal(parsed.name, 'project');
  });

  it('works with github http urls', function() {
    var parsed = parseUrl('https://github.com/donejs/donejs-travis.git');
    assert.equal(parsed.owner, 'donejs');
    assert.equal(parsed.name, 'donejs-travis');
  });

  it('works with github ssh urls', function() {
    var parsed = parseUrl('git@github.com:donejs/donejs-travis.git');
    assert.equal(parsed.owner, 'donejs');
    assert.equal(parsed.name, 'donejs-travis');
  });
});
