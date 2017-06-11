const Build = require('github-build')

const data = {
  repo: provess.env.TRAVIS_REPO_SLUG,
  sha: process.env.TRAVIS_PULL_REQUEST_SHA,
  token: process.env.github_token,
  label: 'perfbench',
  description: 'Performance benchmarking'
}

const build = new Build(data)

let pass = () => {} // noop
let fail = () => process.exit(1)

/* If github token is given */
if (process.env.github_token) {
  build.start()
  pass = () => build.pass()
  fail = () => build.fail()
}

module.exports = { pass, fail }
