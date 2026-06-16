#!/bin/bash

echo "🚀 Inserting demo data..."

# Get current user ID
USER_ID=$(sf data query -q "SELECT Id FROM User WHERE Username='trailsignup.307f57e6fd52bd@salesforce.com' LIMIT 1" -o myDevOrg --json | jq -r '.result.records[0].Id')

# プロジェクト1
P1=$(sf data create record -s CustomProject__c -v "Name='顧客ポータル開発' Project_Code__c='PROJ-001' Status__c='In Progress' Priority__c='High' Budget__c=5000000 Start_Date__c=2026-02-01 End_Date__c=2026-05-31" -o myDevOrg --json | jq -r '.result.id')
echo "✓ Project 1: $P1"

# プロジェクト2
P2=$(sf data create record -s CustomProject__c -v "Name='モバイルアプリ開発' Project_Code__c='PROJ-002' Status__c='In Progress' Priority__c='Medium' Budget__c=3000000 Start_Date__c=2026-03-01 End_Date__c=2026-06-30" -o myDevOrg --json | jq -r '.result.id')
echo "✓ Project 2: $P2"

# プロジェクト3
P3=$(sf data create record -s CustomProject__c -v "Name='社内システム改修' Project_Code__c='PROJ-003' Status__c='Planning' Priority__c='Low' Budget__c=2000000 Start_Date__c=2026-04-01 End_Date__c=2026-07-31" -o myDevOrg --json | jq -r '.result.id')
echo "✓ Project 3: $P3"

echo ""
echo "📝 Creating tasks..."

# プロジェクト1のタスク
sf data create record -s CustomTask__c -v "Name='要件定義' CustomProject__c='$P1' Status__c='Completed' Priority__c='High' Due_Date__c=2026-02-15 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='基本設計' CustomProject__c='$P1' Status__c='Completed' Priority__c='High' Due_Date__c=2026-03-01 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='詳細設計' CustomProject__c='$P1' Status__c='In Progress' Priority__c='High' Due_Date__c=2026-03-31 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='フロント実装' CustomProject__c='$P1' Status__c='In Progress' Priority__c='High' Due_Date__c=2026-04-30 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='API実装' CustomProject__c='$P1' Status__c='Not Started' Priority__c='High' Due_Date__c=2026-05-15 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='テスト' CustomProject__c='$P1' Status__c='Not Started' Priority__c='Medium' Due_Date__c=2026-05-25 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
echo "✓ Created 6 tasks for Project 1"

# プロジェクト2のタスク
sf data create record -s CustomTask__c -v "Name='UI設計' CustomProject__c='$P2' Status__c='Completed' Priority__c='High' Due_Date__c=2026-03-15 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='iOS開発' CustomProject__c='$P2' Status__c='In Progress' Priority__c='High' Due_Date__c=2026-05-31 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='Android開発' CustomProject__c='$P2' Status__c='In Progress' Priority__c='High' Due_Date__c=2026-06-15 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='ストア申請' CustomProject__c='$P2' Status__c='Not Started' Priority__c='Medium' Due_Date__c=2026-06-25 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
echo "✓ Created 4 tasks for Project 2"

# プロジェクト3のタスク
sf data create record -s CustomTask__c -v "Name='現状分析' CustomProject__c='$P3' Status__c='Completed' Priority__c='Medium' Due_Date__c=2026-04-10 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='要件整理' CustomProject__c='$P3' Status__c='In Progress' Priority__c='High' Due_Date__c=2026-04-30 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
sf data create record -s CustomTask__c -v "Name='改修計画' CustomProject__c='$P3' Status__c='Not Started' Priority__c='Medium' Due_Date__c=2026-05-20 Assigned_To__c='$USER_ID'" -o myDevOrg > /dev/null
echo "✓ Created 3 tasks for Project 3"

echo ""
echo "✅ Demo data inserted!"
echo "   Projects: 3"
echo "   Tasks: 13"
