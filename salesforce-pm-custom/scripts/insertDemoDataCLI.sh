#!/bin/bash

echo "🚀 Inserting demo data for Custom Project Management System"
echo "============================================================"

# プロジェクト作成
echo ""
echo "📦 Creating CustomProjects..."

sf data create record -s CustomProject__c -v "Name='顧客ポータル開発プロジェクト' Project_Code__c='CUST-001' Status__c='In Progress' Priority__c='High' Budget__c=5000000 Start_Date__c=$(date -v-60d +%Y-%m-%d) End_Date__c=$(date -v+30d +%Y-%m-%d)" -o myDevOrg --json | jq -r '.result.id' > /tmp/proj1_id.txt

sf data create record -s CustomProject__c -v "Name='モバイルアプリ刷新' Project_Code__c='MOBILE-002' Status__c='In Progress' Priority__c='Medium' Budget__c=3000000 Start_Date__c=$(date -v-30d +%Y-%m-%d) End_Date__c=$(date -v+60d +%Y-%m-%d)" -o myDevOrg --json | jq -r '.result.id' > /tmp/proj2_id.txt

sf data create record -s CustomProject__c -v "Name='社内業務システム改修' Project_Code__c='INTERNAL-003' Status__c='Planning' Priority__c='Low' Budget__c=1500000 Start_Date__c=$(date +%Y-%m-%d) End_Date__c=$(date -v+90d +%Y-%m-%d)" -o myDevOrg --json | jq -r '.result.id' > /tmp/proj3_id.txt

PROJ1=$(cat /tmp/proj1_id.txt)
PROJ2=$(cat /tmp/proj2_id.txt)
PROJ3=$(cat /tmp/proj3_id.txt)

echo "✓ Created 3 projects"
echo "  - Project 1: $PROJ1"
echo "  - Project 2: $PROJ2"
echo "  - Project 3: $PROJ3"

# タスク作成（プロジェクト1）
echo ""
echo "📝 Creating CustomTasks for Project 1..."

sf data create record -s CustomTask__c -v "Name='要件定義' CustomProject__c='$PROJ1' Status__c='Completed' Priority__c='High' Due_Date__c=$(date -v-50d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='画面設計書作成' CustomProject__c='$PROJ1' Status__c='Completed' Priority__c='High' Due_Date__c=$(date -v-40d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='データベース設計' CustomProject__c='$PROJ1' Status__c='Completed' Priority__c='High' Due_Date__c=$(date -v-35d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='ログイン機能実装' CustomProject__c='$PROJ1' Status__c='In Progress' Priority__c='High' Due_Date__c=$(date -v+5d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='ユーザー登録機能' CustomProject__c='$PROJ1' Status__c='In Progress' Priority__c='High' Due_Date__c=$(date -v+10d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='決済機能実装' CustomProject__c='$PROJ1' Status__c='Not Started' Priority__c='High' Due_Date__c=$(date -v+25d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='パフォーマンステスト' CustomProject__c='$PROJ1' Status__c='Blocked' Priority__c='High' Due_Date__c=$(date -v+20d +%Y-%m-%d)" -o myDevOrg > /dev/null

echo "✓ Created 7 tasks for Project 1"

# タスク作成（プロジェクト2）
echo ""
echo "📝 Creating CustomTasks for Project 2..."

sf data create record -s CustomTask__c -v "Name='UI/UXデザイン' CustomProject__c='$PROJ2' Status__c='Completed' Priority__c='High' Due_Date__c=$(date -v-20d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='iOS開発環境構築' CustomProject__c='$PROJ2' Status__c='Completed' Priority__c='High' Due_Date__c=$(date -v-25d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='ホーム画面実装（iOS）' CustomProject__c='$PROJ2' Status__c='In Progress' Priority__c='High' Due_Date__c=$(date -v+10d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='ホーム画面実装（Android）' CustomProject__c='$PROJ2' Status__c='In Progress' Priority__c='High' Due_Date__c=$(date -v+12d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='プッシュ通知実装' CustomProject__c='$PROJ2' Status__c='Not Started' Priority__c='Medium' Due_Date__c=$(date -v+30d +%Y-%m-%d)" -o myDevOrg > /dev/null

echo "✓ Created 5 tasks for Project 2"

# タスク作成（プロジェクト3）
echo ""
echo "📝 Creating CustomTasks for Project 3..."

sf data create record -s CustomTask__c -v "Name='現行システム調査' CustomProject__c='$PROJ3' Status__c='Completed' Priority__c='High' Due_Date__c=$(date -v-5d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='改修要件整理' CustomProject__c='$PROJ3' Status__c='In Progress' Priority__c='High' Due_Date__c=$(date -v+5d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='技術選定' CustomProject__c='$PROJ3' Status__c='In Progress' Priority__c='Medium' Due_Date__c=$(date -v+8d +%Y-%m-%d)" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='キックオフMTG' CustomProject__c='$PROJ3' Status__c='Not Started' Priority__c='High' Due_Date__c=$(date -v+10d +%Y-%m-%d)" -o myDevOrg > /dev/null

echo "✓ Created 4 tasks for Project 3"

# クリーンアップ
rm -f /tmp/proj*_id.txt

echo ""
echo "✅ Demo data inserted successfully!"
echo ""
echo "Summary:"
echo "  - 3 CustomProjects"
echo "  - 16 CustomTasks"
echo "    • Completed: 5"
echo "    • In Progress: 6"
echo "    • Not Started: 4"
echo "    • Blocked: 1"
echo ""
echo "Open Salesforce: sf org open -o myDevOrg"
