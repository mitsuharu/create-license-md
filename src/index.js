#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const checker = require("license-checker");

const pkg = require(path.join(process.cwd(), "package.json"));
const directDeps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
const outputPath = process.argv[2] || "licenses.md";

checker.init({ start: process.cwd(), json: true }, function (err, json) {
  if (err) {
    console.error("❌ ライセンス情報の取得に失敗:", err);
    process.exit(1);
  }

  const markdownLines = ["# 使用パッケージのライセンス一覧\n"];

  for (const key of Object.keys(json)) {
    const [fullName, version] = key.match(/^(@?[^@]+)@(.+)$/).slice(1);

    // 直接依存のみ抽出
    if (!(fullName in directDeps)) continue;

    const info = json[key];
    markdownLines.push(`## ${fullName}\n`);
    markdownLines.push(`- Version: ${version}`);
    if (info.publisher) {
      markdownLines.push(`- Author: ${info.publisher}`);
    }
    if (info.licenses) {
      markdownLines.push(`- License: ${info.licenses}`);
    }
    if (info.repository) {
      markdownLines.push(`- Repository: ${info.repository}`);
    }
    markdownLines.push(``);
  }

  fs.writeFileSync(outputPath, markdownLines.join("\n"));
  console.log(`✅ ${outputPath} を生成しました！`);
});