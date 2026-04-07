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

const REPORT_DIR = path.join(__dirname, '..', 'context', 'report');
const ANALYTICS_DIR = path.join(__dirname, '..', 'context', 'analytics');

const isUpdate = process.argv.includes('--update');

async function main() {
  const notionApiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!notionApiKey || !databaseId) {
    console.error('Error: NOTION_API_KEY and NOTION_DATABASE_ID must be set in .env');
    console.error('Create a .env file based on .env.example');
    process.exit(1);
  }

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
    // TODO: Notion API連携の実装
    // @notionhq/client パッケージを使用してデータベースにページを作成
  }

  if (isUpdate) {
    console.log('Updating analytics data...');
    // TODO: アナリティクスデータの同期
  }

  console.log('Sync complete.');
}

main().catch(console.error);
