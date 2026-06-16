# AppPage では Work Guide が使えない

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

AppPage (Lightning App のホーム) に `interaction_orchestrator:workGuide` コンポーネントを配置してデプロイ。

---

## 注意点

- `このコンポーネントは範囲に許可されたインターフェースを実装しません` でデプロイ失敗
- Work Guide は **Record Page でのみ配置可能**
- ホーム画面（AppPage / HomePage）では使えない

---

## 対処

### 対処法 1: ホーム画面では Work Guide は諦め、承認待ちリストビューで代用

```xml
<componentInstances>
    <componentName>force:filterListCard</componentName>
    <identifier>approvalList</identifier>
    <componentInstanceProperties>
        <name>entityNames</name>
        <valueList>
            <valueListItems>
                <value>Ringi_Approver__c</value>
            </valueListItems>
        </valueList>
    </componentInstanceProperties>
    <componentInstanceProperties>
        <name>filterName</name>
        <value>Mine</value>
    </componentInstanceProperties>
</componentInstances>
```

---

### 対処法 2: Work Guide は各レコードの Record Page 側で表示する運用

- ホーム画面: 承認待ちリスト（ListView）
- レコード画面: Work Guide（Record Page の Header に配置）

#### Record Page への Work Guide 配置例

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

**visibilityRule**: `Current_Stage__c` が空でない（= Flow が起動中）の時のみ Work Guide を表示。

---

## 関連項目

- [Record Page の Template と主要コンポーネント API 名](./Record%20Page%20の%20Template%20と主要コンポーネント%20API%20名.md)
- [Run Name 露出を抑える方法](../Flow%20Orchestrator/Run%20Name%20露出を抑える方法.md)
