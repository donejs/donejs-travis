module.exports = function makeBadge(fullname) {
  return `[![Build Status](https://travis-ci.org/${fullname}.png?branch=master)](https://travis-ci.org/${fullname})`;
};
