# Run Name 露出を抑える方法

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

Flow Orchestration の実行時、Work Guide の UI に「Run Name」（実行インスタンスの識別子）が表示されてしまい、エンドユーザーに技術的な情報が露出する。

---

## 注意点

- デフォルトでは、Work Guide は Run Name を表示する
- Run Name はシステム管理者やデバッグ時には有用だが、エンドユーザーには不要な情報
- 業務アプリケーション（申請・承認フロー等）では、技術的な情報を隠してシンプルな UI にしたい場合が多い

---

## 対処

FlexiPage の Work Guide コンポーネントで `isRunNameDisplayed=false` を設定する。

### FlexiPage XML の例

```xml
<flexiPageRegions>
    <name>header</name>
    <type>Region</type>
    <componentInstances>
        <componentName>interaction_orchestrator:workGuide</componentName>
        <identifier>work_guide_1</identifier>
        <visibilityRule>
            <criteria>
                <leftValue>{!Record.Current_Stage__c}</leftValue>
                <operator>NE</operator>
                <rightValue></rightValue>
            </criteria>
        </visibilityRule>
        <componentInstanceProperties>
            <name>isRunNameDisplayed</name>
            <value>false</value>
        </componentInstanceProperties>
    </componentInstances>
</flexiPageRegions>
```

### 設定可能な主要プロパティ

| プロパティ名 | 型 | 説明 | デフォルト |
|---|---|---|---|
| `isRunNameDisplayed` | Boolean | Run Name を表示するか | true |
| `variant` | String | 表示形式（`base` / `compact` 等） | base |

---

## 補足: Lightning App Builder UI での設定

FlexiPage を Lightning App Builder で編集する場合:

1. Work Guide コンポーネントを選択
2. 右側のプロパティパネルで「Run Name を表示」のチェックボックスを**オフ**にする
3. 保存して有効化

---

## 関連項目

- [Record Page の Template と主要コンポーネント API 名](../FlexiPage/Record%20Page%20の%20Template%20と主要コンポーネント%20API%20名.md)
