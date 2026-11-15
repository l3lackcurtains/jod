#!/usr/bin/env node
// Builds portable/ from skills/: the same skills, in plain Agent Skills format
// (https://agentskills.io) for tools other than Claude Code (Codex, Cursor,
// OpenCode, GitHub Copilot, Gemini CLI, ZCode, ...).
//
//   node scripts/build-portable.mjs          rebuild portable/
//   node scripts/build-portable.mjs --check  exit 1 if portable/ is stale
//
// Changes made for portability:
//   - folders and `name:` get a `jod-` prefix (generic names like `task` would clash)
//   - `/jod:<skill>` commands become `/jod-<skill>`; links follow the renamed folders
//   - Claude Code-only syntax is rewritten: `$ARGUMENTS`, inline !`cmd` context,
//     and the `argument-hint` / `when_to_use` frontmatter keys
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, statSync, existsSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'skills')
const out = join(root, 'portable')
const isCheck = process.argv.includes('--check')

const skills = readdirSync(src).filter((d) => statSync(join(src, d)).isDirectory())

function transform(text) {
  let t = text.replace(/\r\n/g, '\n')
  // frontmatter
  t = t.replace(/^---\n([\s\S]*?)\n---\n/, (_, fm) => {
    const lines = fm
      .split('\n')
      .filter((l) => !/^(argument-hint|when_to_use):/.test(l))
      .map((l) => l.replace(/^name: (\S+)$/, (_m, n) => `name: jod-${n}`))
    return `---\n${lines.join('\n')}\n---\n`
  })
  // commands and cross-skill links
  for (const s of skills) {
    t = t.replaceAll(`/jod:${s}`, `/jod-${s}`)
    t = t.replaceAll(`../${s}/`, `../jod-${s}/`)
  }
  // references to a skill by name, e.g. "the `engineering` skill", "(`engineering` §2)"
  for (const s of skills) t = t.replaceAll('`' + s + '` skill', '`jod-' + s + '` skill').replaceAll('`' + s + '` §', '`jod-' + s + '` §')
  // Claude Code-only syntax
  t = t.replace(/Arguments: `\$ARGUMENTS`/g, "Arguments: the user's request")
  t = t.replace(/Bug report: `\$ARGUMENTS`/g, "Bug report: the user's description")
  t = t.replace(/Options: `\$ARGUMENTS`/g, 'Options: from the request')
  t = t.replace(/!`([^`]+)`/g, 'run `$1`')
  return t
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

// Frontmatter guard: an unquoted value containing ": " or " #" breaks YAML, and the
// skill then loads with no metadata at all (silently). Quote such values.
const fmErrors = []
for (const s of skills) {
  const text = readFileSync(join(src, s, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n')
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!fm) { fmErrors.push(`${s}/SKILL.md: missing frontmatter`); continue }
  for (const line of fm[1].split('\n')) {
    const m = line.match(/^([\w-]+): (.*)$/)
    if (!m) continue
    const v = m[2]
    if (/^["']/.test(v)) continue
    if (v.includes(': ') || v.includes(' #') || /^[&*!|>%@`{[]/.test(v)) fmErrors.push(`${s}/SKILL.md: quote the value of "${m[1]}"`)
  }
  if (!/^name: /m.test(fm[1]) || !/^description: /m.test(fm[1])) fmErrors.push(`${s}/SKILL.md: needs name and description`)
}
if (fmErrors.length) {
  console.error('Frontmatter problems:\n  ' + fmErrors.join('\n  '))
  process.exit(1)
}

const files = new Map()
for (const s of skills) {
  for (const file of walk(join(src, s))) {
    const rel = relative(join(src, s), file)
    files.set(join(out, `jod-${s}`, rel), transform(readFileSync(file, 'utf8')))
  }
}

if (isCheck) {
  const stale = [...files].filter(([p, c]) => !existsSync(p) || readFileSync(p, 'utf8').replace(/\r\n/g, '\n') !== c)
  const expected = new Set(files.keys())
  const extra = existsSync(out) ? walk(out).filter((p) => !expected.has(p)) : []
  if (stale.length || extra.length) {
    console.error('portable/ is out of date. Run: node scripts/build-portable.mjs')
    for (const [p] of stale) console.error('  stale:', relative(root, p))
    for (const p of extra) console.error('  extra:', relative(root, p))
    process.exit(1)
  }
  console.log(`portable/ is up to date (${files.size} files)`)
} else {
  rmSync(out, { recursive: true, force: true })
  for (const [p, c] of files) {
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, c)
  }
  console.log(`built portable/ (${skills.length} skills, ${files.size} files)`)
}
