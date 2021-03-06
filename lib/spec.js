var hogan = require('hogan.js');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var getServiceProperties = require('./serviceProperties');

var templateFile = fs.readFileSync(path.resolve(__dirname, '../templates/spec.mustache'), 'utf-8');
var template = hogan.compile(templateFile);


function getReleaseNumber(pkg, release) {
  var release = _.get(pkg, 'spec.release');
  return release || 1;
}

function getRequiredBuildPackages(pkg) {
  return _.get(pkg, 'spec.buildRequires', []);
}

function getRequiredPackages(pkg) {
  return _.get(pkg, 'spec.requires', []);
}

function getNodeVersion(pkg) {
  return _.get(pkg, 'spec.nodeVersion');
}

function getExecutableFiles(pkg) {
  var name = pkg.name;
  var executableFiles = _.get(pkg, 'spec.executable', []).map(function (file) {
    return path.join('/usr/lib/', name, file);
  });

  return {
    executableFiles: executableFiles,
    hasExecutableFiles: executableFiles.length !== 0
  };
}

function getPostInstallCommands(pkg) {
  return _.get(pkg, 'spec.post', []);
}

function shouldPrune(pkg) {
  return _.get(pkg, 'spec.prune', true);
}

module.exports = function (pkg, release) {
  var serviceProperties = _.assign({
      release: getReleaseNumber(pkg, release),
      requires: getRequiredPackages(pkg),
      buildRequires: getRequiredBuildPackages(pkg),
      postInstallCommands: getPostInstallCommands(pkg),
      nodeVersion: getNodeVersion(pkg),
      version: pkg.version,
      license: pkg.license,
      prune: shouldPrune(pkg)
    },
    getExecutableFiles(pkg),
    getServiceProperties(pkg)
  );

  return template.render(serviceProperties);
};
