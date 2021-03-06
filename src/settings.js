const fs = require('fs')
const argv = require('yargs-parser')(process.argv.slice(2))
const pkgDir = require('pkg-dir')
const { resolve } = require('path')
const { error } = require('prettycli')
const yaml = require('js-yaml')
const { optimalValues } = require('./properties')

let settings = {}
const properties = ['runs', 'fail', 'url', 'debug', 'thresholds']

/*
  There are 3 layers of settings.

  In increasing order of priority:
  1. defaults
  2. config file
  3. cli params
*/

const defaults = {
  runs: 3,
  fail: true,
  debug: false,
  thresholds: {},
  event: 'push'
}
let fileSettings = {}
let cliParams = {}

const root = pkgDir.sync()
const configPath = resolve(root, '.perf.yml')
const configFileExists = fs.existsSync(configPath)

/* file */
if (configFileExists) {
  try {
    fileSettings = yaml.safeLoad(fs.readFileSync(configPath))
  } catch ({ message }) {
    error(message, { silent: true })
  }
}

/* cli */
for (let property of properties) {
  if (argv[property]) cliParams[property] = argv[property]
}
if (process.argv[2]) cliParams.url = process.argv[2]

Object.assign(settings, defaults, fileSettings, cliParams)

/* validation */
for (let property of properties) {
  if (typeof settings[property] === 'undefined')
    error(`${property} is missing`, { silent: true })
}

if (!Array.isArray(settings.thresholds)) settings.thresholds = []

/* Merge defaults and settings to get thresholds */
settings.thresholds = Object.assign({}, optimalValues, ...settings.thresholds)
if (settings.debug) console.log('setting: ', settings)

module.exports = settings
