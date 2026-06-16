# User オブジェクトの Hierarchy 型と QuickAction での LWC 参照

**目的**: User オブジェクトに自己参照のカスタム項目を追加する際の正しい手順、および QuickAction から LWC を参照する際のデプロイ順序の把握。

---

## 1. User オブジェクトの自己参照カスタム項目は Hierarchy 型

### 1.1 事象

User オブジェクトに自己参照（他のユーザーを指す）カスタム項目を追加しようとして、以下のエラーが発生:

```
Error  force-app/main/default/objects/User/fields/Delegate_Approver__c.field-meta.xml
       不正なデータ型です (1:1)
```

### 1.2 原因

User オブジェクトには特殊な項目型 `<type>Hierarchy</type>` が存在する。通常の Lookup 項目 `<type>Lookup</type>` では User オブジェクトへの自己参照はサポートされない。

### 1.3 正しい書き方

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Delegate_Approver__c</fullName>
    <label>代理承認者</label>
    <description>代理承認を依頼するユーザー</description>
    <type>Hierarchy</type>
    <relationshipName>DelegateApprovals</relationshipName>
</CustomField>
```

**重要**: 
- `<type>Hierarchy</type>` を使う
- `<referenceTo>User</referenceTo>` は **指定しない**（指定するとエラーになる）
- `<relationshipName>` のみ指定可能
- 標準の `Manager` 項目と同じ構造

### 1.4 参考: 標準の Manager 項目の構造

User オブジェクトには既に `ManagerId` という Hierarchy 型の項目が存在する。これを参考にすると良い:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>ManagerId</fullName>
    <type>Hierarchy</type>
    <relationshipName>Manager</relationshipName>
</CustomField>
```

### 1.5 Hierarchy 型の制約

- User オブジェクトでのみ使用可能
- 必ず User オブジェクトへの自己参照になる
- `<referenceTo>` は不要（指定すると deploy 失敗）
- SOQL では通常の Lookup と同様にアクセス可能: `SELECT Delegate_Approver__c, Delegate_Approver__r.Name FROM User`

---

## 2. QuickAction で LWC を参照する場合の注意

### 2.1 事象

QuickAction のメタデータに LWC を参照する設定を追加し deploy したが、以下のエラーが発生:

```
Error  force-app/main/default/quickActions/Ringi_Approver__c.Delegate_Approval.quickAction-meta.xml
       Unable to retrieve lightning component by namespace/developer name (2:2)
```

### 2.2 原因

QuickAction をデプロイする時点で、参照先の LWC が組織にデプロイされていない場合に発生。

### 2.3 正しいデプロイ順序

1. **まず LWC をデプロイ**:
   ```bash
   sf project deploy start --target-org <org> --source-dir force-app/main/default/lwc/<component-name>
   ```

2. **デプロイ成功を確認**:
   - 成功メッセージで `LightningComponentBundle` がデプロイされたことを確認
   - `Succeeded` が表示されることを確認

3. **その後、QuickAction をデプロイ**:
   ```bash
   sf project deploy start --target-org <org> --source-dir force-app/main/default/quickActions/
   ```
   または
   ```bash
   sf project deploy start --target-org <org> --source-dir force-app/main/default/objects/<Object>/actions/
   ```

### 2.4 QuickAction での LWC 参照の書き方

```xml
<?xml version="1.0" encoding="UTF-8"?>
<QuickAction xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>代理承認を依頼</label>
    <optionsCreateFeedItem>false</optionsCreateFeedItem>
    <standardLabel>LogACall</standardLabel>
    <targetObject>Ringi_Approver__c</targetObject>
    <type>LightningComponent</type>
    <lightningComponent>delegateApprovalButton</lightningComponent>
</QuickAction>
```

**注意**:
- `<lightningComponent>` の値は、LWC のフォルダ名（component の `kebab-case` ではなく `camelCase`）
- `c:` などの namespace 指定は不要（デフォルトは `c` namespace）
- オブジェクト固有の QuickAction は `force-app/main/default/objects/<Object>/actions/` 配下に配置が推奨

---

## 3. よくある見落としパターン

| パターン | 症状 | 対処 |
|---|---|---|
| User 自己参照を `<type>Lookup</type>` で定義 | 「不正なデータ型です」エラー | `<type>Hierarchy</type>` に変更 |
| Hierarchy 型に `<referenceTo>User</referenceTo>` を指定 | deploy エラー | `<referenceTo>` を削除 |
| QuickAction を先に deploy、LWC が未デプロイ | "Unable to retrieve lightning component" エラー | LWC を先にデプロイしてから QuickAction をデプロイ |
| QuickAction の `<lightningComponent>` に間違った名前 | 同上 | LWC フォルダ名と完全一致させる |

---

## 4. チェックリスト: User 自己参照項目を追加する際

1. [ ] `<type>Hierarchy</type>` を使用
2. [ ] `<referenceTo>` を書かない
3. [ ] `<relationshipName>` を指定
4. [ ] 権限セット／プロファイルに `<fieldPermissions>` を追加（Hierarchy 型でも FLS は必要）
5. [ ] ページレイアウトに項目を配置
6. [ ] SOQL で項目が取得できることを確認

---

## 5. 参考リソース

- Salesforce 公式ドキュメント: [Hierarchy Relationship](https://help.salesforce.com/s/articleView?id=sf.customize_relateobjects.htm&type=5)
- User オブジェクトのメタデータ: `force-app/main/default/objects/User/fields/ManagerId.field-meta.xml`

---

## 6. 改訂履歴

| 日付 | 内容 |
|---|---|
| 2026-05-11 | 初版。FlowOrchestrationDemo で User に `Delegate_Approver__c` を追加する際に Lookup 型で deploy 失敗 → Hierarchy 型で解決。また、QuickAction から LWC 参照時の deploy 順序の注意も追記 |
