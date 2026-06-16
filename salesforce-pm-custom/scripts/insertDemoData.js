const jsforce = require('jsforce');
require('dotenv').config();

const conn = new jsforce.Connection({
  loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com'
});

async function main() {
  try {
    await conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD + process.env.SF_SECURITY_TOKEN);
    console.log('✓ Logged in as:', conn.userInfo.id);

    const currentUserId = conn.userInfo.id;
    const today = new Date();

    // CustomProject__c を3件作成
    const projects = await conn.sobject('CustomProject__c').create([
      {
        Name: '顧客ポータル開発プロジェクト',
        Project_Code__c: 'CUST-001',
        Start_Date__c: formatDate(addDays(today, -60)),
        End_Date__c: formatDate(addDays(today, 30)),
        Status__c: 'In Progress',
        Priority__c: 'High',
        Budget__c: 5000000,
        Description__c: 'B2C顧客向けWebポータルの新規構築'
      },
      {
        Name: 'モバイルアプリ刷新',
        Project_Code__c: 'MOBILE-002',
        Start_Date__c: formatDate(addDays(today, -30)),
        End_Date__c: formatDate(addDays(today, 60)),
        Status__c: 'In Progress',
        Priority__c: 'Medium',
        Budget__c: 3000000,
        Description__c: 'iOS/Androidアプリの全面リニューアル'
      },
      {
        Name: '社内業務システム改修',
        Project_Code__c: 'INTERNAL-003',
        Start_Date__c: formatDate(addDays(today, 0)),
        End_Date__c: formatDate(addDays(today, 90)),
        Status__c: 'Planning',
        Priority__c: 'Low',
        Budget__c: 1500000,
        Description__c: '勤怠管理・経費精算システムの改修'
      }
    ]);

    console.log(`✓ Created ${projects.length} CustomProjects`);
    const projectIds = projects.map(p => p.id);

    // CustomTask__c を各プロジェクトに作成
    const tasks = [];

    // プロジェクト1: 顧客ポータル（15タスク）
    const project1Tasks = [
      { name: '要件定義', status: 'Completed', priority: 'High', dueDays: -50 },
      { name: '画面設計書作成', status: 'Completed', priority: 'High', dueDays: -40 },
      { name: 'データベース設計', status: 'Completed', priority: 'High', dueDays: -35 },
      { name: 'フロントエンド環境構築', status: 'Completed', priority: 'Medium', dueDays: -30 },
      { name: 'バックエンドAPI設計', status: 'Completed', priority: 'High', dueDays: -25 },
      { name: 'ログイン機能実装', status: 'In Progress', priority: 'High', dueDays: 5 },
      { name: 'ユーザー登録機能', status: 'In Progress', priority: 'High', dueDays: 10 },
      { name: 'マイページ実装', status: 'In Progress', priority: 'Medium', dueDays: 15 },
      { name: '商品一覧表示機能', status: 'In Progress', priority: 'Medium', dueDays: 12 },
      { name: '決済機能実装', status: 'Not Started', priority: 'High', dueDays: 25 },
      { name: 'メール通知機能', status: 'Not Started', priority: 'Low', dueDays: 28 },
      { name: '管理画面開発', status: 'Not Started', priority: 'Medium', dueDays: 30 },
      { name: 'パフォーマンステスト', status: 'Blocked', priority: 'High', dueDays: 20 },
      { name: 'セキュリティ診断', status: 'Not Started', priority: 'High', dueDays: 28 },
      { name: '本番環境構築', status: 'Not Started', priority: 'High', dueDays: 30 }
    ];

    for (let task of project1Tasks) {
      tasks.push({
        Name: task.name,
        CustomProject__c: projectIds[0],
        Status__c: task.status,
        Priority__c: task.priority,
        Due_Date__c: formatDate(addDays(today, task.dueDays)),
        Assigned_To__c: currentUserId,
        Description__c: `${task.name}の詳細タスク`
      });
    }

    // プロジェクト2: モバイルアプリ（12タスク）
    const project2Tasks = [
      { name: 'UI/UXデザイン', status: 'Completed', priority: 'High', dueDays: -20 },
      { name: 'プロトタイプ作成', status: 'Completed', priority: 'Medium', dueDays: -15 },
      { name: 'iOS開発環境構築', status: 'Completed', priority: 'High', dueDays: -25 },
      { name: 'Android開発環境構築', status: 'Completed', priority: 'High', dueDays: -25 },
      { name: 'ホーム画面実装（iOS）', status: 'In Progress', priority: 'High', dueDays: 10 },
      { name: 'ホーム画面実装（Android）', status: 'In Progress', priority: 'High', dueDays: 12 },
      { name: 'ユーザー設定画面', status: 'In Progress', priority: 'Medium', dueDays: 15 },
      { name: 'プッシュ通知実装', status: 'Not Started', priority: 'Medium', dueDays: 30 },
      { name: '位置情報機能', status: 'Not Started', priority: 'Low', dueDays: 35 },
      { name: 'カメラ連携', status: 'Not Started', priority: 'Low', dueDays: 40 },
      { name: 'アプリストア申請', status: 'Not Started', priority: 'High', dueDays: 55 },
      { name: 'リリース準備', status: 'Not Started', priority: 'High', dueDays: 60 }
    ];

    for (let task of project2Tasks) {
      tasks.push({
        Name: task.name,
        CustomProject__c: projectIds[1],
        Status__c: task.status,
        Priority__c: task.priority,
        Due_Date__c: formatDate(addDays(today, task.dueDays)),
        Assigned_To__c: currentUserId,
        Description__c: `${task.name}の詳細タスク`
      });
    }

    // プロジェクト3: 社内システム（8タスク）
    const project3Tasks = [
      { name: '現行システム調査', status: 'Completed', priority: 'High', dueDays: -5 },
      { name: '改修要件整理', status: 'In Progress', priority: 'High', dueDays: 5 },
      { name: '技術選定', status: 'In Progress', priority: 'Medium', dueDays: 8 },
      { name: '開発体制確立', status: 'Not Started', priority: 'Medium', dueDays: 15 },
      { name: 'キックオフMTG', status: 'Not Started', priority: 'High', dueDays: 10 },
      { name: '基本設計', status: 'Not Started', priority: 'High', dueDays: 30 },
      { name: '詳細設計', status: 'Not Started', priority: 'High', dueDays: 50 },
      { name: 'テスト計画作成', status: 'Not Started', priority: 'Medium', dueDays: 60 }
    ];

    for (let task of project3Tasks) {
      tasks.push({
        Name: task.name,
        CustomProject__c: projectIds[2],
        Status__c: task.status,
        Priority__c: task.priority,
        Due_Date__c: formatDate(addDays(today, task.dueDays)),
        Assigned_To__c: currentUserId,
        Description__c: `${task.name}の詳細タスク`
      });
    }

    // タスクを一括作成
    const result = await conn.sobject('CustomTask__c').create(tasks);
    console.log(`✓ Created ${tasks.length} CustomTasks`);

    // 統計情報
    const statuses = tasks.reduce((acc, t) => {
      acc[t.Status__c] = (acc[t.Status__c] || 0) + 1;
      return acc;
    }, {});

    console.log('\n✅ Demo data inserted successfully!');
    console.log(`\nSummary:`);
    console.log(`  Projects: ${projects.length}`);
    console.log(`  Tasks: ${tasks.length}`);
    console.log(`    - Completed: ${statuses['Completed'] || 0}`);
    console.log(`    - In Progress: ${statuses['In Progress'] || 0}`);
    console.log(`    - Not Started: ${statuses['Not Started'] || 0}`);
    console.log(`    - Blocked: ${statuses['Blocked'] || 0}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

main();
