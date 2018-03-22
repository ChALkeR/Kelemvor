'use strict';

const { packedIn, promiseEvent } = require('./helpers');
const readline = require('readline');
const semver = require('semver');
const Jergal = require('jergal');

const cache = new Map();

function analyzeDep(dep) {
  if (dep === '?') return []; // TODO: warn
  if (cache.has(dep)) return cache.get(dep);
  const pos = dep.lastIndexOf('@');
  if (pos <= 0) {
    console.error(`No version: ${dep}`);
    return [];
  }
  const depname = dep.slice(0, pos);
  const depversion = dep.slice(pos + 1);
  const parts = dep.split('@');
  if (!semver.valid(depversion)) return []; // TODO: warn
  const issues = Jergal.check(depname, depversion);
  for (const issue of issues) {
    issue.name = depname;
    issue.version = depversion;
  }
  cache.set(dep, issues);
  return issues;
}

function analyze(pkg) {
  const result = []; // TODO: check pkg
  for (const dep of pkg.deps) {
    for (const issue of analyzeDep(dep)) {
      result.push(issue);
    }
  }
  return result;
}

async function analyzeAll(depsdb) {
  const filepath = depsdb;
  const stream = packedIn(filepath);
  readline.createInterface({
    input: stream
  }).on('line', line => {
    const match = line.match(/^([0-9]+|\?)\s+([^\s]+):\s*(.*?)$/);
    const dm = match[1] === '?' ? null : parseInt(match[1], 10);
    const name = match[2];
    const deps = JSON.parse(match[3]);
    const issues = analyze({ dm, name, deps });
    if (issues.length === 0) return;
    console.log(`PACKAGE ${name}, downloads/month: ${dm}`);
    for (const issue of issues) {
      console.log(` [${issue.type}] ${issue.name}@${issue.version} — ${issue.title}`);
    }
  });
  await promiseEvent(stream);
}

module.exports = {
  analyze,
  analyzeAll,
};
