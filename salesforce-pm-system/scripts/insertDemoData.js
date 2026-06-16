const jsforce = require('jsforce');
require('dotenv').config();

const conn = new jsforce.Connection({
  loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com'
});

async function main() {
  await conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD + process.env.SF_SECURITY_TOKEN);
  console.log('✓ Logged in');

  const currentUserId = conn.userInfo.id;
  const today = new Date();

  // プロジェクト3件
  const projects = await conn.sobject('Project__c').create([
    {
      Name: '顧客ポータル開発',
      Project_Code__c: 'PRJ-001',
      Start_Date__c: new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString().split('T')[0],
      End_Date__c: new Date(today.getFullYear(), today.getMonth() + 1, 30).toISOString().split('T')[0],
      Status__c: 'In Progress',
      Priority__c: 'High',
      Planned_Budget__c: 5000000,
      Actual_Cost__c: 3200000,
      Project_Manager__c: currentUserId,
      Description__c: 'B2C顧客向けポータルサイトの構築'
    },
    {
      Name: 'モバイルアプリリニューアル',
      Project_Code__c: 'PRJ-002',
      Start_Date__c: new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString().split('T')[0],
      End_Date__c: new Date(today.getFullYear(), today.getMonth() + 2, 15).toISOString().split('T')[0],
      Status__c: 'In Progress',
      Priority__c: 'Medium',
      Planned_Budget__c: 3000000,
      Actual_Cost__c: 1500000,
      Project_Manager__c: currentUserId,
      Description__c: 'iOS/Androidアプリの全面リニューアル'
    },
    {
      Name: '社内管理システム改修',
      Project_Code__c: 'PRJ-003',
      Start_Date__c: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
      End_Date__c: new Date(today.getFullYear(), today.getMonth() + 3, 30).toISOString().split('T')[0],
      Status__c: 'Planning',
      Priority__c: 'Low',
      Planned_Budget__c: 2000000,
      Actual_Cost__c: 200000,
      Project_Manager__c: currentUserId,
      Description__c: '社内勤怠・経費精算システムの改修'
    }
  ]);

  const projectIds = projects.map(p => p.id);
  console.log('✓ Created 3 projects');

  // マイルストーン
  const milestones = await conn.sobject('Milestone__c').create([
    { Name: 'フェーズ1完了', Project__c: projectIds[0], Due_Date__c: new Date(today.getFullYear(), today.getMonth() - 1, 30).toISOString().split('T')[0], Status__c: 'Completed' },
    { Name: 'フェーズ2完了', Project__c: projectIds[0], Due_Date__c: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0], Status__c: 'In Progress' },
    { Name: 'リリース', Project__c: projectIds[0], Due_Date__c: new Date(today.getFullYear(), today.getMonth() + 1, 30).toISOString().split('T')[0], Status__c: 'Planned' },
    { Name: 'デザイン完了', Project__c: projectIds[1], Due_Date__c: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0], Status__c: 'In Progress' },
    { Name: 'ベータ版リリース', Project__c: projectIds[1], Due_Date__c: new Date(today.getFullYear(), today.getMonth() + 1, 15).toISOString().split('T')[0], Status__c: 'Planned' }
  ]);

  console.log('✓ Created milestones');

  // タスク40件（完了15、進行中12、未着手10、ブロック3）
  const tasks = [];

  // プロジェクト1: 顧客ポータル開発（20タスク）
  const p1Tasks = [
    { name: '要件定義', status: 'Completed', priority: 'High', progress: 100, startDays: -60, dueDays: -50, estHours: 40 },
    { name: '画面設計', status: 'Completed', priority: 'High', progress: 100, startDays: -50, dueDays: -40, estHours: 60 },
    { name: 'DB設計', status: 'Completed', priority: 'High', progress: 100, startDays: -48, dueDays: -38, estHours: 40 },
    { name: 'API設計', status: 'Completed', priority: 'High', progress: 100, startDays: -45, dueDays: -35, estHours: 32 },
    { name: 'ログイン機能実装', status: 'Completed', priority: 'High', progress: 100, startDays: -35, dueDays: -28, estHours: 24 },
    { name: 'ユーザー登録機能実装', status: 'Completed', priority: 'High', progress: 100, startDays: -34, dueDays: -27, estHours: 20 },
    { name: 'マイページ実装', status: 'In Progress', priority: 'High', progress: 70, startDays: -20, dueDays: 5, estHours: 40 },
    { name: '決済機能実装', status: 'In Progress', priority: 'High', progress: 50, startDays: -15, dueDays: 10, estHours: 80 },
    { name: '商品検索機能', status: 'In Progress', priority: 'Medium', progress: 60, startDays: -18, dueDays: 7, estHours: 32 },
    { name: 'カート機能', status: 'In Progress', priority: 'High', progress: 40, startDays: -10, dueDays: 8, estHours: 40 },
    { name: '注文履歴表示', status: 'Not Started', priority: 'Medium', progress: 0, startDays: 5, dueDays: 20, estHours: 24 },
    { name: 'レビュー機能', status: 'Not Started', priority: 'Low', progress: 0, startDays: 10, dueDays: 25, estHours: 32 },
    { name: 'お気に入り機能', status: 'Not Started', priority: 'Low', progress: 0, startDays: 12, dueDays: 27, estHours: 16 },
    { name: 'プッシュ通知実装', status: 'Blocked', priority: 'Medium', progress: 0, startDays: -5, dueDays: 15, estHours: 24 },
    { name: 'メール通知機能', status: 'In Progress', priority: 'Medium', progress: 30, startDays: -8, dueDays: 10, estHours: 20 }
  ];

  for (let t of p1Tasks) {
    tasks.push({
      Name: t.name,
      Project__c: projectIds[0],
      Status__c: t.status,
      Priority__c: t.priority,
      Progress__c: t.progress,
      Start_Date__c: addDays(today, t.startDays),
      Due_Date__c: addDays(today, t.dueDays),
      Estimated_Hours__c: t.estHours,
      Actual_Hours__c: t.status === 'Completed' ? t.estHours * 1.1 : (t.progress > 0 ? t.estHours * t.progress / 100 : 0),
      Assigned_To__c: currentUserId
    });
  }

  // プロジェクト2: モバイルアプリ（15タスク）
  const p2Tasks = [
    { name: 'デザインコンセプト策定', status: 'Completed', priority: 'High', progress: 100, startDays: -30, dueDays: -22 },
    { name: 'ワイヤーフレーム作成', status: 'Completed', priority: 'High', progress: 100, startDays: -25, dueDays: -18 },
    { name: 'UI/UXデザイン', status: 'In Progress', priority: 'High', progress: 80, startDays: -20, dueDays: 5 },
    { name: 'iOS開発環境構築', status: 'Completed', priority: 'High', progress: 100, startDays: -28, dueDays: -25 },
    { name: 'Android開発環境構築', status: 'Completed', priority: 'High', progress: 100, startDays: -28, dueDays: -25 },
    { name: 'ホーム画面実装（iOS）', status: 'In Progress', priority: 'High', progress: 60, startDays: -15, dueDays: 8 },
    { name: 'ホーム画面実装（Android）', status: 'In Progress', priority: 'High', progress: 55, startDays: -15, dueDays: 10 },
    { name: '設定画面実装', status: 'Not Started', priority: 'Medium', progress: 0, startDays: 5, dueDays: 20 },
    { name: 'プロフィール画面', status: 'Not Started', priority: 'Medium', progress: 0, startDays: 8, dueDays: 22 },
    { name: 'パフォーマンス最適化', status: 'Not Started', priority: 'High', progress: 0, startDays: 15, dueDays: 35 },
    { name: 'ストア申請準備', status: 'Not Started', priority: 'High', progress: 0, startDays: 30, dueDays: 50 }
  ];

  for (let t of p2Tasks) {
    tasks.push({
      Name: t.name,
      Project__c: projectIds[1],
      Status__c: t.status,
      Priority__c: t.priority,
      Progress__c: t.progress,
      Start_Date__c: addDays(today, t.startDays),
      Due_Date__c: addDays(today, t.dueDays),
      Estimated_Hours__c: 40,
      Assigned_To__c: currentUserId
    });
  }

  // プロジェクト3: 社内システム（5タスク）
  const p3Tasks = [
    { name: '現行システム調査', status: 'Completed', priority: 'Medium', progress: 100, startDays: -10, dueDays: -5 },
    { name: '改修要件整理', status: 'In Progress', priority: 'Medium', progress: 40, startDays: -8, dueDays: 5 },
    { name: '技術選定', status: 'In Progress', priority: 'High', progress: 60, startDays: -5, dueDays: 3 },
    { name: '見積作成', status: 'Blocked', priority: 'Medium', progress: 0, startDays: 0, dueDays: 10 },
    { name: 'キックオフMTG', status: 'Not Started', priority: 'High', progress: 0, startDays: 10, dueDays: 12 }
  ];

  for (let t of p3Tasks) {
    tasks.push({
      Name: t.name,
      Project__c: projectIds[2],
      Status__c: t.status,
      Priority__c: t.priority,
      Progress__c: t.progress,
      Start_Date__c: addDays(today, t.startDays),
      Due_Date__c: addDays(today, t.dueDays),
      Estimated_Hours__c: 16,
      Assigned_To__c: currentUserId
    });
  }

  await conn.sobject('Task__c').create(tasks);
  console.log(`✓ Created ${tasks.length} tasks`);

  console.log('\n✅ Demo data inserted successfully!');
  console.log(`- Projects: ${projects.length}`);
  console.log(`- Milestones: ${milestones.length}`);
  console.log(`- Tasks: ${tasks.length}`);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

main().catch(console.error);
