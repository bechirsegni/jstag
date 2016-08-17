const Promise = require('bluebird');
const GitRepo = require('git-tools');
const semver = require('semver');
const { resolve: resolvePath } = require('path');
const fs = Promise.promisifyAll(require('fs'));

Promise.promisifyAll(GitRepo.prototype);

module.exports = function () {
  const repo = new GitRepo(resolvePath(__dirname, '..'));

  return repo.execAsync('log', '--oneline')
    .then(findReleaseCommit)
    .then(parseReleaseCommit)
    .then(commitTag => getPackageJson()
      .then(packageJson => updatePackageVersion(repo, packageJson, commitTag.version))
      .then(() => tagRelease(repo, commitTag.version)));
}

function findReleaseCommit (log) {
  return log.split('\n')
    .map(parseCommitLine)
    .find(([hash, message]) => hasCommitTag('release', message));
}

function parseCommitLine (line) {
  return /([^\s]+)\s(.+)/.exec(line).slice(1);
}

function hasCommitTag (commitTag, commitMessage) {
  return new RegExp(`^${commitTag}:\\s\\d+\\.\\d+.\\d+$`).test(commitMessage);
}

function parseReleaseCommit (releaseCommit) {
  if (releaseCommit == null) {
    throw new Error("No release tag found");
  }
  return parseCommitTag(releaseCommit);
}

function parseCommitTag (commitMessage) {
  const [_, tagName, version] = /(\w+):\s(\d+\.\d+\.\d+)/.exec(commitMessage);

  return { tagName, version };
}

function getPackageJsonPath () {
  return resolvePath(__dirname, '..', 'package.json');
}

function getPackageJson () {
  return fs.readFileAsync(getPackageJsonPath(), 'utf-8').then(JSON.parse);
}

function updatePackageVersion (repo, packageJson, nextVersion) {
  if (packageJson.version === nextVersion) {
    // Version in package.json is already correct
    return Promise.resolve();
  }
  return writePackageVersion(packageJson, nextVersion)
    .then(() => updatePackageJsonRemote(repo, nextVersion));
}

function writePackageVersion (packageJson, nextVersion) {
  packageJson.version = nextVersion;
  return Promise.try(() => JSON.stringify(packageJson, null, '  '))
    .then(text => fs.writeFileAsync(getPackageJsonPath(), `${text}\n`, 'utf-8'));
}

function updatePackageJsonRemote (repo, version) {
  return repo.execAsync('add', 'package.json')
    .then(() => repo.execAsync('commit', '-m',
      `release: ${version} (automatically updated package.json)`))
    .then(() => repo.currentBranchAsync())
    .then(currentBranch => repo.execAsync('push', 'origin', getRemote(currentBranch)))
    .then(() => {
      // Bail out of this build and let CI pick up the next build:
      throw new Error('Build failed. Updated package.json and triggering another build');
    });
}

function tagRelease (repo, version) {
  return repo.execAsync('tag', `v${version}`)
    .then(() => repo.currentBranchAsync()
      .then(currentBranch => repo.execAsync('push', 'origin', getRemote(currentBranch), '--tags')))
    // TODO: we should only catch the "tag already exists" errpr
    .catch(noop);
}

function getRemote (localBranch) {
  return `${localBranch}:${process.env.JSTAG_CI_MASTER_BRANCH}`;
}

function noop () {}
