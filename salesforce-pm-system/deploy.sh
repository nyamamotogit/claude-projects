#!/bin/bash

echo "🚀 Salesforce PM System Deployment"
echo "==================================="
echo ""

# Step 1: メタデータデプロイ
echo "📦 Step 1: Deploying metadata..."
sf project deploy start -d force-app -o myDevOrg

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Metadata deployed successfully"
echo ""

# Step 2: D3.js確認
echo "📊 Step 2: Checking D3.js static resource..."
echo "⚠️  Manual action required:"
echo "    1. Download https://d3js.org/d3.v7.min.js"
echo "    2. Upload as Static Resource named 'd3'"
echo ""
read -p "Press Enter when D3.js is uploaded..."

# Step 3: デモデータ投入
echo "💾 Step 3: Inserting demo data..."

if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.template .env
    echo "❗ Please edit .env with your credentials"
    exit 1
fi

npm install
node scripts/insertDemoData.js

if [ $? -ne 0 ]; then
    echo "❌ Data insertion failed"
    exit 1
fi

echo "✅ Demo data inserted"
echo ""

# 完了
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Open Salesforce: sf org open -o myDevOrg"
echo "  2. Navigate to Project__c record"
echo "  3. Edit Lightning Page and add 'ganttChart' component"
echo ""
