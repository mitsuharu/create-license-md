#!/usr/bin/env node
const fs = require('node:fs')
const path = require('node:path')
const pacote = require('pacote')
const os = require('node:os')

const formatAuthor = (author) => {
  if (typeof author === 'string') return author
  if (typeof author === 'object') return author.name || JSON.stringify(author)
  return 'Unknown'
}

const getLicenses = async (outputPath = 'licenses.md') => {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found in current directory.')
    process.exit(1)
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  }

  const sections = ['# Licenses\n']

  for (const [pkgName, versionSpec] of Object.entries(allDeps)) {
    try {
      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), `${pkgName.replace('/', '_')}-`),
      )
      await pacote.extract(`${pkgName}@${versionSpec}`, tmpDir)
      const pkgData = JSON.parse(
        fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
      )

      const lines = [
        `## ${pkgName}\n`,
        `- Version: ${pkgData.version || versionSpec}`,
        `- License: ${pkgData.license || 'Unknown'}`,
        `- Author: ${formatAuthor(pkgData.author)}`,
      ]
      if (pkgData.repository?.url) {
        lines.push(`- Repository: ${pkgData.repository.url}`)
      }
      if (pkgData.homepage) {
        lines.push(`- Homepage: ${pkgData.homepage}`)
      }

      const section = `${lines.join('\n')}\n`
      sections.push(section)
    } catch (err) {
      console.warn(`⚠️ Failed to fetch ${pkgName}: ${err.message}`)
    }
  }

  const markdown = sections.join('\n')
  fs.writeFileSync(outputPath, markdown, 'utf-8')
  console.log(`✅ License info written to: ${outputPath}`)
}

// CLI引数から出力パス取得
const outputPathArg = process.argv[2]
getLicenses(outputPathArg || 'licenses.md')
