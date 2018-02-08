var makeBadge = require('./make-badge');
var parseUrl = require('./parse-git-url');
var Generator = require('yeoman-generator');
var gitRemoteOriginUrl = require('git-remote-origin-url');

module.exports = Generator.extend({
  constructor: function(args, opts) {
    Generator.call(this, args, opts);

    this.configPath = this.destinationPath('.travis.yml');
    this.readmePath = this.destinationPath('README.md');
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
    if (this.abort || this.skipBadge) {
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

  _writeTravisConfig: function writeTravisConfig() {
    this.log('Writing config file to ' + this.configPath);
    this.fs.copyTpl(this.templatePath('travis.yml'), this.configPath);
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
