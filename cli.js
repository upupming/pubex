#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const argv = process.argv;
const projectDir = process.cwd();
const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
const pkgManager = pkgInfo ? pkgInfo.name : 'npm';

async function run() {
  const pkgJsonFile = path.join(projectDir, 'package.json');
  const pkgJsonFileBak = pkgJsonFile + '.bak';
  if (!fs.existsSync(pkgJsonFile)) {
    throw new Error('Missing package.json file in the project root');
  }
  const pkg = require(pkgJsonFile);
  /** @type {string} */
  let suffix;
  try {
    const p = spawnSync('git', ['rev-parse', 'HEAD']);
    if (p.error) throw p.error;
    if (p.stderr.toString()) throw p.stderr.toString();
    suffix = p.stdout.toString().slice(0, 6);
  } catch (e) {
    suffix = currentTime();
  }
  pkg.version = `0.0.0-experimental-${suffix}`;
  fs.renameSync(pkgJsonFile, pkgJsonFileBak);
  fs.writeFileSync(pkgJsonFile, JSON.stringify(pkg, null, 2));
  try {
    spawnSync(
      pkgManager,
      ['publish', '--no-git-checks', '--tag', 'experimental'],
      {
        stdio: 'inherit',
      },
    );
  } finally {
    fs.renameSync(pkgJsonFileBak, pkgJsonFile);
  }
}

run();

/**
 * @param {string | undefined} userAgent process.env.npm_config_user_agent
 * @returns object | undefined
 */
function pkgFromUserAgent(userAgent) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(' ')[0];
  const pkgSpecArr = pkgSpec.split('/');
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

function currentTime() {
  const dt = new Date();
  const y = dt.getFullYear();
  const m = dt.getMonth() + 1;
  const d = dt.getDate();
  const h = dt.getHours();
  const mm = dt.getMinutes();
  const s = dt.getSeconds();
  const offset = -dt.getTimezoneOffset() / 60;

  const pad = function (/** @type {number} */ x) {
    return `00${x}`.slice(-2);
  };

  return `${y}-${pad(m)}-${pad(d)}-${pad(h)}-${pad(m)}-${pad(s)}-utc-${
    offset > 0 ? 'plus' : 'minus'
  }-${offset}`;
}
