# Release Instructions

## Preparing a Release

lytics/jstag uses [SemVer](http://semver.org/). The next version number should be carefully
considered. Once a version number is decided on, the `version` field in `package.json` should
be updated accordingly. Note that this step is not stictly necessary. If the version is not
updated, CI will attempt to update the version in `package.json` and then start another build

```sh
git remote update
git checkout master
git reset --hard origin/master
git merge --no-ff --no-edit origin/develop
git commit -m --allow-empty "release: [semver version number]"
git push origin master
```

<aside class="notice">
_NOTE_: until the new changes are on develop, the branch wired for CI deployment is actually `master2`
</aside>

If git push succeeds, [Travis](https://travis-ci.org/lytics/jstag/builds) will start running tests on
the master branch. When all the tests pass, a git tag will automatically be created and pushed to
the repo. The naming convention used for git tags is `v[semver version number]`.

If the build succeeds, Travis will deploy jstag assets and source code to [Github Releases](https://github.com/lytics/jstag/releases)
and will deploy assets to the `lytics-js` bucket on Google Cloud Storage.
