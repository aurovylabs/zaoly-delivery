#!/usr/bin/env node
/** After export:community — commit + push sibling community git remote. */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = process.env.ZAOLY_COMMUNITY_ROOT || resolve(ROOT, '..', 'zaoly-delivery')

function git(args) {
  return execFileSync('git', args, { cwd: out, encoding: 'utf8' })
}

if (!existsSync(resolve(out, '.git'))) {
  console.error('No .git in', out, '— clone chbrdk/zaoly-delivery there first')
  process.exit(1)
}

git(['add', '-A'])
const status = git(['status', '--porcelain'])
if (!status.trim()) {
  console.log('Community pack unchanged; nothing to push')
  process.exit(0)
}

const msg =
  process.env.ZAOLY_COMMUNITY_COMMIT_MSG ||
  'chore: refresh community distribution from internal export'

git(['commit', '-m', msg])
git(['push', 'origin', 'HEAD'])
console.log('Pushed community pack →', out)
