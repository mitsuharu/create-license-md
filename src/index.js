#!/usr/bin/env node

const fs = require("fs");
const checker = require("license-checker");

checker.init({ start: process.cwd() }, function (err, json) {
  if (err) {
    console.error("ライセンス情報の取得に失敗:", err);
    process.exit(1);
  } else {
    let markdown = "# 使用パッケージのライセンス一覧\n\n";
    for (const [name, info] of Object.entries(json)) {
      markdown += `## ${name}\n`;
      markdown += `- バージョン: ${info.version}\n`;
      markdown += `- ライセンス: ${info.licenses}\n`;
      if (info.repository) markdown += `- リポジトリ: ${info.repository}\n`;
      if (info.publisher) markdown += `- 著作権: ${info.publisher}\n`;
      markdown += `\n`;
    }

    fs.writeFileSync("licenses.md", markdown);
    console.log("✅ licenses.md を生成しました！");
  }
});
