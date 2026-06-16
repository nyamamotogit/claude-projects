# CustomObject searchLayouts 空タグの罠

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

カスタムオブジェクトを作成し、アプリのタブから開くと、Lightning の「Recently Viewed」や検索バーで結果を開いたときに **Name（PK）1 列しか表示されない**。ListView 自体には `<columns>` で件名・金額・ステータス等を指定しているのに、検索結果では見えない。

---

## 注意点

### 誤診されやすさ

- ListView XML は正しく columns 定義されているので「ListView が壊れている」は見当違い
- PermissionSet の FLS も正常
- Tab settings も正常
- 「Search Layouts は Setup UI でしか設定できない」と諦めがち

### 真因

CustomObject XML の `<searchLayouts/>` が**自己閉じタグ（空）**のまま。これは過去の Salesforce 規定で「SearchLayout を触らない」という意味だが、**Lightning では空=PK 列のみ表示**になる挙動。

---

## 対処

CustomObject XML に `<searchLayouts>` セクションを埋めてデプロイ。4 系統を設定:

```xml
<searchLayouts>
    <!-- Recently Viewed / タブ一覧 -->
    <customTabListAdditionalFields>Subject__c</customTabListAdditionalFields>
    <customTabListAdditionalFields>Status__c</customTabListAdditionalFields>
    
    <!-- Lookup ダイアログ -->
    <lookupDialogsAdditionalFields>Subject__c</lookupDialogsAdditionalFields>
    
    <!-- ListView 上部の検索バー -->
    <searchFilterFields>NAME</searchFilterFields>
    <searchFilterFields>Subject__c</searchFilterFields>
    
    <!-- グローバル検索結果 -->
    <searchResultsAdditionalFields>Subject__c</searchResultsAdditionalFields>
    <searchResultsAdditionalFields>Status__c</searchResultsAdditionalFields>
</searchLayouts>
```

---

## 発見方法（プロジェクト全体チェック）

```bash
# 空 searchLayouts を検出
grep -l "<searchLayouts/>" force-app/main/default/objects/*/*.object-meta.xml
```

空のままのオブジェクトは**デモで必ず目立つ欠陥**になるので、デプロイ前に全件埋める。

---

## デモ Org 構築前のチェックリストに追加

- [ ] 全 CustomObject の searchLayouts が空でない
- [ ] 4 系統（customTabList/lookupDialogs/searchFilter/searchResults）に最低限の項目を含む
- [ ] Subject/件名/金額/ステータス相当の「業務で人が認識する項目」が最初に入っている

---

## 横展開: 他の Salesforce 案件でも必ず再発

- 標準オブジェクト（Account/Opportunity）は Salesforce 側で自動で埋められているので気付きにくいが、CustomObject は開発者が明示しないと空
- 稟議/契約/申請/ケース系のカスタム業務オブジェクトは全て対象
- Dev Edition の sfdx-new の雛形は空 `<searchLayouts/>` で生成される → 必ず手で埋める

---

## 関連項目

- [PermissionSet FLS セッションキャッシュ遅延](./PermissionSet%20FLS%20セッションキャッシュ遅延.md)
- [Report XML の reportType と field の特殊記法](./Report%20XML%20の%20reportType%20と%20field%20の特殊記法.md)
