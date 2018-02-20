var yaml = require('js-yaml');
var makeBadge = require('./make-badge');
var parseUrl = require('./parse-git-url');
var isObject = require('lodash/isObject');
var Generator = require('yeoman-generator');
var gitRemoteOriginUrl = require('git-remote-origin-url');
var parseTravisTemplate = require('./parse-travis-template');

module.exports = Generator.extend({
  constructor: function(args, opts) {
    Generator.call(this, args, opts);

    this.configPath = this.destinationPath('.travis.yml');
    this.readmePath = this.destinationPath('README.md');
    this.pkgPath = this.destinationPath('package.json');
    this.pkg = this.fs.readJSON(this.pkgPath, {});
  },

  initializing: function initializing() {
    var configExists = this.fs.exists(this.configPath);
    var readmeExists = this.fs.exists(this.readmePath);

    if (configExists) {
      this.abort = true;
      this.log.error('.travis.yml file already exists, aborting command.');
      return;
    }

    if (readmeExists) {
      var readme = this.fs.read(this.readmePath);

      // checks whether the badge link is in the README already
      var badgeExists = /\!\[Build Status\]/.test(readme);

      if (badgeExists) {
        this.skipBadge = true;
      }
    } else {
      this.log('WARNING: README.md not found, Travis badge skipped');
      this.skipBadge = true;
    }
  },

  prompting: function prompting() {
    if (this.abort) {
      return;
    }

    var self = this;
    var done = self.async();

    gitRemoteOriginUrl()
      .then(parseUrl, function onError() {
        return parseUrl('');
      })
      .then(self._prompt.bind(self))
      .then(function(answers) {
        self.props = answers;
        done();
      });
  },

  writing: function writing() {
    if (!this.abort) {
      this._writePackageJson();
      this._writeTravisConfig();
      this._writeTravisBadge();
    }
  },

  /* private methods */
  _prompt: function prompt(parsed) {
    return this.prompt([
      {
        type: 'input',
        name: 'owner',
        message: 'What is the GitHub owner name?',
        default: parsed.owner ? parsed.owner : null
      },
      {
        type: 'input',
        name: 'name',
        message: 'What is the GitHub repository name?',
        default: parsed.name ? parsed.name : null
      }
    ]);
  },

  _writePackageJson: function writePackageJson() {
    this.log('Updating "repository" property of ' + this.pkgPath);

    if (this.props.owner && this.props.name) {
      var repo = `${this.props.owner}/${this.props.name}`;

      if (isObject(this.pkg.repository)) {
        this.pkg.repository.url = repo;
      } else {
        this.pkg.repository = repo;
      }

      this.fs.writeJSON(this.pkgPath, this.pkg);
    }
  },

  _writeTravisConfig: function writeTravisConfig() {
    this.log('Writing config file to ' + this.configPath);
    this.fs.write(this.configPath, yaml.safeDump(parseTravisTemplate()));
  },

  _writeTravisBadge: function writeTravisBadge() {
    if (!this.skipBadge && this.props.owner && this.props.name) {
      var readme = this.fs.read(this.readmePath);
      var badge = makeBadge(this.props.owner + '/' + this.props.name);

      this.log('Adding Travis badge markdown to ' + this.readmePath);
      this.fs.write(this.readmePath, `${badge}\n${readme}`);
    }
  }
});
