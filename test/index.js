var fs = require('fs');
var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('donejs-travis', function() {
  // user following the guide
  describe('travis.yml does not exist but README.md does', function() {
    before(function(done) {
      helpers
        .run(path.join(__dirname, '..', 'default'))
        .withPrompts({ owner: 'owner', name: 'place-my-order' })
        .inTmpDir(function(dir) {
          fs.copyFileSync(
            path.join(__dirname, 'readme_fixture.md'),
            path.join(dir, 'README.md')
          );
        })
        .on('end', done);
    });

    it('should write config file', function() {
      assert.fileContent('.travis.yml', /language: node_js/);
    });

    it('should add travis badge to readme', function() {
      assert.fileContent('README.md', /\!\[Build Status\]/);
    });
  });

  describe('no travis.yml, existing README.md but empty options', function() {
    before(function(done) {
      helpers
        .run(path.join(__dirname, '..', 'default'))
        .inTmpDir(function(dir) {
          fs.copyFileSync(
            path.join(__dirname, 'readme_fixture.md'),
            path.join(dir, 'README.md')
          );
        })
        .on('end', done);
    });

    it('should write config file', function() {
      assert.fileContent('.travis.yml', /language: node_js/);
    });

    it('does not add the badge with missing data', function() {
      assert.noFileContent('README.md', /\!\[Build Status\]/);
    });
  });

  describe('no travis.yml, no README.md', function() {
    before(function(done) {
      helpers
        .run(path.join(__dirname, '..', 'default'))
        .inTmpDir()
        .on('end', done);
    });

    it('should write config file', function() {
      assert.fileContent('.travis.yml', /language: node_js/);
    });

    it('skips the badge', function() {
      assert.noFile('README.md');
    });
  });

  describe('travis.yml file exists already', function() {
    before(function(done) {
      helpers
        .run(path.join(__dirname, '..', 'default'))
        .inTmpDir(function(dir) {
          fs.copyFileSync(
            path.join(__dirname, 'travis_fixture.yml'),
            path.join(dir, '.travis.yml')
          );
        })
        .on('end', done);
    });

    it('should not overwrite file', function() {
      assert.fileContent('.travis.yml', /language: ruby/);
    });
  });
});
