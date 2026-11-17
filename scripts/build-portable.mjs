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
//     and the `argument-hint` / `user-invocable` frontmatter keys
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
      .filter((l) => !/^(argument-hint|user-invocable):/.test(l))
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
  t = t.replace(/Scope: `\$ARGUMENTS`/g, 'Scope: from the request')
  t = t.replace(/`\$ARGUMENTS`/g, "the user's request")
  t = t.replace(/!`([^`]+)`/g, 'run `$1`')
  // Claude Code's question tool: other tools just ask in chat
  t = t.replace(/ask with AskUserQuestion \(multi-select\)/g, 'ask the user (they can pick several)')
  t = t.replace(/ask with AskUserQuestion/g, 'ask the user')
  t = t.replace(/ask one AskUserQuestion:/g, 'ask one question:')
  t = t.replace(/Use AskUserQuestion:/g, 'Ask the user:')
  t = t.replace(/AskUserQuestion/g, 'a question to the user')
  // Claude Code permission settings: only where the tool has an equivalent
  t = t.replace(
    'Then offer the hard guards as ready `.claude/settings.json` snippets.',
    "Then, if this tool has a permissions or hooks config (Claude Code's is `.claude/settings.json`), offer the hard guards as ready snippets for it; otherwise skip this.",
  )
  return t
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

// Skill lint (Agent Skills spec + skill-creator guidance). Any problem fails the build.
//   - frontmatter parses: an unquoted value containing ": " or " #" breaks YAML, and the
//     skill then loads with no metadata at all (silently). Quote such values.
//   - name and description present; name matches the folder, lowercase-hyphen, <= 64 chars
//   - description <= 1024 chars (the spec's limit; it is the trigger, so it must fit)
//   - no `when_to_use`: it is Claude Code-only, so portable/ would lose it; put it in description
//   - SKILL.md body under 500 lines; longer guides go in references/
//   - a reference file over 300 lines needs a table of contents
//   - every relative Markdown link points at a file that exists
const problems = []
const isEval = (rel) => rel.split(/[\\/]/)[0] === 'evals'
for (const s of skills) {
  const text = readFileSync(join(src, s, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n')
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!fm) { problems.push(`${s}/SKILL.md: missing frontmatter`); continue }
  const meta = {}
  for (const line of fm[1].split('\n')) {
    const m = line.match(/^([\w-]+): (.*)$/)
    if (!m) continue
    const v = m[2]
    meta[m[1]] = v.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"')
    if (/^["']/.test(v)) continue
    if (v.includes(': ') || v.includes(' #') || /^[&*!|>%@`{[]/.test(v)) problems.push(`${s}/SKILL.md: quote the value of "${m[1]}"`)
  }
  if (!meta.name || !meta.description) problems.push(`${s}/SKILL.md: needs name and description`)
  if (meta.name && meta.name !== s) problems.push(`${s}/SKILL.md: name "${meta.name}" must match the folder name`)
  if (meta.name && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.name)) problems.push(`${s}/SKILL.md: name must be lowercase letters, digits and hyphens`)
  if (meta.name && meta.name.length > 60) problems.push(`${s}/SKILL.md: name too long once prefixed with jod-`)
  if ('when_to_use' in meta) problems.push(`${s}/SKILL.md: move when_to_use into description (other tools ignore it)`)
  if (meta.description && meta.description.length > 1024) problems.push(`${s}/SKILL.md: description is ${meta.description.length} chars (max 1024)`)
  const lines = text.split('\n').length
  if (lines > 500) problems.push(`${s}/SKILL.md: ${lines} lines (keep under 500; move detail to references/)`)

  for (const file of walk(join(src, s))) {
    const rel = relative(join(src, s), file)
    if (!file.endsWith('.md') || isEval(rel)) continue
    const body = readFileSync(file, 'utf8')
    if (rel.startsWith('references') && body.split('\n').length > 300 && !/^#+ (Contents|Table of contents)/im.test(body))
      problems.push(`${s}/${rel}: over 300 lines; add a "## Contents" section`)
    for (const [, target] of body.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
      if (/^[a-z]+:/i.test(target)) continue // http:, mailto:
      if (!existsSync(join(dirname(file), target))) problems.push(`${s}/${rel}: broken link ${target}`)
    }
  }
}
if (problems.length) {
  console.error('Skill problems:\n  ' + problems.join('\n  '))
  process.exit(1)
}

// evals/ are for developing jod (skill-creator / `claude plugin eval`), not for users.
const files = new Map()
for (const s of skills) {
  for (const file of walk(join(src, s))) {
    const rel = relative(join(src, s), file)
    if (isEval(rel)) continue
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
