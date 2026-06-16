# FlexiPage を Default Record Page に割当てる XML

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

カスタムオブジェクトの Record Page を FlexiPage で作成したが、アプリで開くと標準のデフォルト画面が表示される。

---

## 注意点

- FlexiPage を作成しただけでは、オブジェクトのデフォルト Record Page として割り当てられない
- **CustomApplication XML の `actionOverrides` で明示的に割り当てる必要がある**

---

## 対処

### CustomApplication XML で actionOverrides を追加

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CustomApplication xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>稟議申請</label>
    <navType>Standard</navType>
    <tabs>standard-home</tabs>
    <tabs>Ringi__c</tabs>
    <uiType>Lightning</uiType>
    
    <!-- ここが重要 -->
    <actionOverrides>
        <actionName>View</actionName>
        <comment>稟議オブジェクトの詳細画面を FlexiPage に割り当て</comment>
        <content>Ringi_Record_Page</content>
        <formFactor>Large</formFactor>
        <pageOrSobjectType>Ringi__c</pageOrSobjectType>
        <skipRecordTypeSelect>false</skipRecordTypeSelect>
        <type>Flexipage</type>
    </actionOverrides>
</CustomApplication>
```

### 主要パラメータ

| パラメータ | 説明 | 値例 |
|---|---|---|
| `actionName` | オーバーライドするアクション | `View`（詳細画面）, `Edit`（編集画面）, `New`（新規作成） |
| `content` | FlexiPage の API 名 | `Ringi_Record_Page` |
| `formFactor` | デバイス種別 | `Large`（デスクトップ）, `Small`（モバイル） |
| `pageOrSobjectType` | 対象オブジェクト | `Ringi__c` |
| `type` | タイプ | `Flexipage` |

---

## 別の方法: Setup UI で割り当て

1. Setup → オブジェクトマネージャー → [カスタムオブジェクト]
2. Lightning レコードページ → ページを割り当て
3. 対象アプリ・Record Type ごとに FlexiPage を選択
4. 保存

---

## 複数 Record Type がある場合

Record Type ごとに異なる FlexiPage を割り当てる場合:

```xml
<actionOverrides>
    <actionName>View</actionName>
    <content>Ringi_HQ_Record_Page</content>
    <formFactor>Large</formFactor>
    <pageOrSobjectType>Ringi__c</pageOrSobjectType>
    <recordType>HQ_Approval</recordType>
    <skipRecordTypeSelect>false</skipRecordTypeSelect>
    <type>Flexipage</type>
</actionOverrides>

<actionOverrides>
    <actionName>View</actionName>
    <content>Ringi_Branch_Record_Page</content>
    <formFactor>Large</formFactor>
    <pageOrSobjectType>Ringi__c</pageOrSobjectType>
    <recordType>Branch_Approval</recordType>
    <skipRecordTypeSelect>false</skipRecordTypeSelect>
    <type>Flexipage</type>
</actionOverrides>
```

---

## 関連項目

- [Record Page の Template と主要コンポーネント API 名](./Record%20Page%20の%20Template%20と主要コンポーネント%20API%20名.md)
