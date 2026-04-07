/**
 * Notion同期スクリプト
 *
 * レポート（context/report/）をNotionデータベースに同期する。
 * --update フラグ付きで実行すると、アナリティクスデータも含めて更新する。
 *
 * 環境変数:
 *   NOTION_API_KEY    - Notion Integration Token
 *   NOTION_DATABASE_ID - 同期先のNotionデータベースID
 *
 * 使用方法:
 *   npm run sync-notion          # レポートの同期
 *   npm run sync-notion:update   # アナリティクス含む更新
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('@notionhq/client');

const REPORT_DIR = path.join(__dirname, '..', 'context', 'report');
const ANALYTICS_DIR = path.join(__dirname, '..', 'context', 'analytics');

const isUpdate = process.argv.includes('--update');

/**
 * レポートファイル名からメタデータを抽出する
 * 形式: report_YYYYMMDD_{テーマ名}.md
 */
function parseReportFilename(filename) {
  const match = filename.match(/^report_(\d{4})(\d{2})(\d{2})_(.+)\.md$/);
  if (!match) return null;
  return {
    date: `${match[1]}-${match[2]}-${match[3]}`,
    theme: match[4],
  };
}

/**
 * Markdown文字列をNotionブロックに変換する（段落単位）
 */
function markdownToBlocks(markdown) {
  const blocks = [];
  const paragraphs = markdown.split(/\n\n+/);

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // コードブロック
    if (trimmed.startsWith('```')) {
      const codeMatch = trimmed.match(/^```(\w*)\n([\s\S]*?)```$/);
      if (codeMatch) {
        blocks.push({
          object: 'block',
          type: 'code',
          code: {
            rich_text: [{ type: 'text', text: { content: codeMatch[2].trim() } }],
            language: codeMatch[1] || 'plain text',
          },
        });
        continue;
      }
    }

    // 見出し
    const h3 = trimmed.match(/^###\s+(.+)/);
    if (h3) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: h3[1] } }] },
      });
      continue;
    }
    const h2 = trimmed.match(/^##\s+(.+)/);
    if (h2) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: h2[1] } }] },
      });
      continue;
    }

    // 箇条書き
    if (trimmed.match(/^[-*]\s/m)) {
      const items = trimmed.split('\n').filter(l => l.match(/^[-*]\s/));
      for (const item of items) {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: item.replace(/^[-*]\s+/, '') } }],
          },
        });
      }
      continue;
    }

    // 通常の段落（Notion APIは2000文字制限）
    const text = trimmed.slice(0, 2000);
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: text } }] },
    });
  }

  return blocks;
}

/**
 * 既存ページをタイトルで検索する
 */
async function findExistingPage(notion, databaseId, title) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Name',
      title: { equals: title },
    },
  });
  return response.results[0] || null;
}

/**
 * レポートをNotionデータベースに同期する
 */
async function syncReport(notion, databaseId, filename, content) {
  const meta = parseReportFilename(filename);
  const title = meta ? `${meta.theme}（${meta.date}）` : filename.replace('.md', '');

  const properties = {
    Name: { title: [{ text: { content: title } }] },
  };

  // dateプロパティが存在する場合に設定（データベースのスキーマに依存）
  if (meta) {
    properties['Date'] = { date: { start: meta.date } };
  }

  const blocks = markdownToBlocks(content);

  // 既存ページの検索
  const existing = await findExistingPage(notion, databaseId, title);

  if (existing) {
    // 既存ページを更新: プロパティ更新のみ（ブロックは追記しない）
    await notion.pages.update({
      page_id: existing.id,
      properties,
    });
    console.log(`  Updated existing page: ${title}`);
  } else {
    // 新規ページ作成
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties,
      children: blocks.slice(0, 100), // Notion APIの制限: 最大100ブロック
    });
    console.log(`  Created new page: ${title}`);
  }
}

/**
 * アナリティクスCSVをNotionデータベースに同期する
 */
async function syncAnalytics(notion, databaseId) {
  if (!fs.existsSync(ANALYTICS_DIR)) {
    console.log('No analytics data found in context/analytics/');
    return;
  }

  const files = fs.readdirSync(ANALYTICS_DIR).filter(f => f.endsWith('.csv'));
  if (files.length === 0) {
    console.log('No CSV files found in context/analytics/');
    return;
  }

  for (const file of files) {
    const csvContent = fs.readFileSync(path.join(ANALYTICS_DIR, file), 'utf-8');
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) continue;

    const headers = lines[0].split(',').map(h => h.trim());
    console.log(`  Syncing analytics: ${file} (${lines.length - 1} rows)`);

    // CSVデータをサマリとしてNotionページに保存
    const title = `Analytics: ${file.replace('.csv', '')}`;
    const existing = await findExistingPage(notion, databaseId, title);

    const blocks = [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: `アナリティクス: ${file}` } }] },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: `カラム: ${headers.join(', ')}\nデータ行数: ${lines.length - 1}` } }],
        },
      },
    ];

    // テーブルブロックとしてデータを追加（最大行数を制限）
    const maxRows = Math.min(lines.length, 51); // ヘッダー + 最大50行
    const tableRows = [];
    for (let i = 0; i < maxRows; i++) {
      const cells = lines[i].split(',').map(c => [{ type: 'text', text: { content: c.trim() } }]);
      tableRows.push({ type: 'table_row', table_row: { cells } });
    }

    if (tableRows.length > 0) {
      blocks.push({
        object: 'block',
        type: 'table',
        table: {
          table_width: headers.length,
          has_column_header: true,
          has_row_header: false,
          children: tableRows,
        },
      });
    }

    if (existing) {
      await notion.pages.update({
        page_id: existing.id,
        properties: { Name: { title: [{ text: { content: title } }] } },
      });
      console.log(`    Updated: ${title}`);
    } else {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: { Name: { title: [{ text: { content: title } }] } },
        children: blocks.slice(0, 100),
      });
      console.log(`    Created: ${title}`);
    }
  }
}

async function main() {
  const notionApiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!notionApiKey || !databaseId) {
    console.error('Error: NOTION_API_KEY and NOTION_DATABASE_ID must be set in .env');
    console.error('Create a .env file based on .env.example');
    process.exit(1);
  }

  const notion = new Client({ auth: notionApiKey });

  // レポートファイルの読み込み
  if (!fs.existsSync(REPORT_DIR)) {
    console.log('No reports found in context/report/');
    return;
  }

  const reports = fs.readdirSync(REPORT_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${reports.length} report(s) to sync`);

  for (const report of reports) {
    const content = fs.readFileSync(path.join(REPORT_DIR, report), 'utf-8');
    console.log(`Syncing: ${report}`);
    await syncReport(notion, databaseId, report, content);
  }

  if (isUpdate) {
    console.log('Updating analytics data...');
    await syncAnalytics(notion, databaseId);
  }

  console.log('Sync complete.');
}

main().catch(console.error);
