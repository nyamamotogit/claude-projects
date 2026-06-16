# Record Page の Template と主要コンポーネント API 名

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

Lightning Record Page を FlexiPage XML で書こうとして推測で組み、デプロイ失敗。

---

## 注意点

- コンポーネント API 名と region 構造の組合せに**クセが多い**
- 公式ドキュメントの例が標準オブジェクトベースで、カスタムオブジェクト向けの情報が乏しい
- 推測で書くとデプロイエラーになりやすい

---

## 対処

**Lightning App Builder で UI 作成 → `sf project retrieve` で取得して雛形にするのが最短確実。**

以下は、実際の稟議オブジェクト Record Page（`flexipage:recordHomeTwoColEqualHeaderTemplateDesktop` テンプレート）で取得した実働構造。

---

## Template 種類

| Template API 名 | 説明 |
|---|---|
| `flexipage:recordHomeTwoColEqualHeaderTemplateDesktop` | 2列同幅 + ヘッダー |
| `flexipage:recordHomeTemplateDesktop` | ヘッダ + サイドバー（1列 + サイドバー） |
| `flexipage:recordHomeThreeColTemplateDesktop` | 3列レイアウト |

---

## Region 名

| Region 名 | 説明 |
|---|---|
| `header` | ヘッダー領域（Highlights Panel / Path 等） |
| `leftcol` | 左カラム |
| `rightcol` | 右カラム |
| `Facet-*` | UUID ベース名で独立 region として定義（Tab / Tabset の body に使用） |

---

## 主要コンポーネント API 名

### 1. Highlights Panel

```xml
<componentInstances>
    <componentName>force:highlightsPanel</componentName>
    <identifier>highlightsPanel</identifier>
</componentInstances>
```

**注意**: Compact Layout に依存。Compact Layout が定義されていないとエラー。

---

### 2. Path

```xml
<componentInstances>
    <componentName>runtime_sales_pathassistant:pathAssistant</componentName>
    <identifier>pathAssistant</identifier>
    <componentInstanceProperties>
        <name>variant</name>
        <value>linear</value>
    </componentInstanceProperties>
</componentInstances>
```

---

### 3. Work Guide

```xml
<componentInstances>
    <componentName>interaction_orchestrator:workGuide</componentName>
    <identifier>work_guide_1</identifier>
    <componentInstanceProperties>
        <name>isRunNameDisplayed</name>
        <value>false</value>
    </componentInstanceProperties>
</componentInstances>
```

**注意**: `runtime_flowOrchestration:workGuide` や `forceWorkGuide:workGuide` は誤り。

---

### 4. Detail Panel（Layout 依存）

```xml
<componentInstances>
    <componentName>force:detailPanel</componentName>
    <identifier>detailPanel</identifier>
</componentInstances>
```

---

### 5. 関連リスト個別

```xml
<componentInstances>
    <componentName>force:relatedListSingleContainer</componentName>
    <identifier>relatedList_Approvers</identifier>
    <componentInstanceProperties>
        <name>parentFieldApiName</name>
        <value>Ringi__c</value>
    </componentInstanceProperties>
    <componentInstanceProperties>
        <name>relatedListApiName</name>
        <value>Approvers__r</value>
    </componentInstanceProperties>
    <componentInstanceProperties>
        <name>relatedListComponentOverride</name>
        <value>ADVGRID</value>
    </componentInstanceProperties>
</componentInstances>
```

---

### 6. Tab と Tabset

#### Tabset

```xml
<componentInstances>
    <componentName>flexipage:tabset</componentName>
    <identifier>tabset_1</identifier>
    <componentInstanceProperties>
        <name>tabs</name>
        <valueList>
            <valueListItems>
                <value>Facet-a1b2c3d4-e5f6-7890-abcd-ef1234567890</value>
            </valueListItems>
            <valueListItems>
                <value>Facet-12345678-90ab-cdef-1234-567890abcdef</value>
            </valueListItems>
        </valueList>
    </componentInstanceProperties>
</componentInstances>
```

#### Tab（Facet として定義）

```xml
<flexiPageRegions>
    <name>Facet-a1b2c3d4-e5f6-7890-abcd-ef1234567890</name>
    <type>Facet</type>
    <componentInstances>
        <componentName>flexipage:tab</componentName>
        <identifier>tab_1</identifier>
        <componentInstanceProperties>
            <name>title</name>
            <value>詳細</value>
        </componentInstanceProperties>
        <componentInstanceProperties>
            <name>body</name>
            <value>Facet-body-uuid</value>
        </componentInstanceProperties>
    </componentInstances>
</flexiPageRegions>

<flexiPageRegions>
    <name>Facet-body-uuid</name>
    <type>Facet</type>
    <!-- 実際のコンポーネント群 -->
</flexiPageRegions>
```

---

### 7. Chatter

```xml
<componentInstances>
    <componentName>forceChatter:recordFeedContainer</componentName>
    <identifier>chatter</identifier>
</componentInstances>
```

---

### 8. Activity

```xml
<componentInstances>
    <componentName>runtime_sales_activities:activityPanel</componentName>
    <identifier>activityPanel</identifier>
</componentInstances>
```

---

## Dynamic Forms（個別フィールド配置）

```xml
<componentInstances>
    <componentName>flexipage:fieldSection</componentName>
    <identifier>fieldSection_1</identifier>
    <componentInstanceProperties>
        <name>columns</name>
        <value>2</value>
    </componentInstanceProperties>
    <componentInstanceProperties>
        <name>fieldInstances</name>
        <valueList>
            <valueListItems>
                <value>
                    {
                        "field": "Name",
                        "label": "稟議番号",
                        "required": true
                    }
                </value>
            </valueListItems>
            <valueListItems>
                <value>
                    {
                        "field": "Subject__c",
                        "label": "件名",
                        "required": true
                    }
                </value>
            </valueListItems>
        </valueList>
    </componentInstanceProperties>
</componentInstances>
```

**注意**: Dynamic Forms は実装が込み入るため、**UI の「Dynamic Forms アップグレード」ウィザードで生成した XML を基準にするのが確実**。

---

## 推奨ワークフロー

1. Lightning App Builder で UI 作成
2. `sf project retrieve start -m "FlexiPage:PageName" -o <alias>`
3. 取得した XML を雛形として、他の Record Page を構築

---

## 関連項目

- [AppPage では Work Guide が使えない](./AppPage%20では%20Work%20Guide%20が使えない.md)
- [FlexiPage を Default Record Page に割当てる XML](./FlexiPage%20を%20Default%20Record%20Page%20に割当てる%20XML.md)
