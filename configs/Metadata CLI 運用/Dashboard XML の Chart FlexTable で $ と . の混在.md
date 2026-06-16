# Dashboard XML の Chart / FlexTable で $ と . の混在

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

Dashboard XML を CLI で記述してデプロイしようとしたら、`invalid field` エラーが発生。Report XML と同じ記法（`Ringi__c$Status__c`）で書いたが、Dashboard では通らない。

---

## 注意点

Dashboard XML のフィールド参照記法は**コンポーネント種別によって異なる**:

| コンポーネント種別 | フィールド記法 | 例 |
|---|---|---|
| Chart（グラフ系） | **`$`（ドル記号）** | `Ringi__c$Status__c` |
| FlexTable（表） | **`.`（ドット）** | `Ringi__c.Status__c` |

**Report XML とも微妙に違う**（Report は `$` 統一、aggregate だけ `.`）。

---

## 対処

### Chart 系コンポーネント（グラフ）

```xml
<dashboardComponent>
    <autoselectColumnsFromReport>false</autoselectColumnsFromReport>
    <chartAxisRange>Auto</chartAxisRange>
    <componentType>Pie</componentType>
    <displayUnits>Auto</displayUnits>
    <groupingColumn>Ringi__c$Status__c</groupingColumn>
    <header>稟議ステータス別件数</header>
    <indicatorBreakpoint1>33.0</indicatorBreakpoint1>
    <indicatorBreakpoint2>67.0</indicatorBreakpoint2>
    <indicatorHighColor>#00FF00</indicatorHighColor>
    <indicatorLowColor>#FF0000</indicatorLowColor>
    <indicatorMiddleColor>#FFFF00</indicatorMiddleColor>
    <report>Ringi_Reports/Ringi_Status_Count__x</report>
    <showPercentage>true</showPercentage>
    <showValues>true</showValues>
    <sortBy>RowLabelAscending</sortBy>
    <useReportChart>false</useReportChart>
</dashboardComponent>
```

**ポイント**: `<groupingColumn>Ringi__c$Status__c</groupingColumn>` （`$` を使う）

---

### FlexTable（表）

```xml
<dashboardComponent>
    <autoselectColumnsFromReport>false</autoselectColumnsFromReport>
    <componentType>FlexTable</componentType>
    <flexComponentProperties>
        <flexComponentProperties>
            <reportColumn>Ringi__c.Name</reportColumn>
            <sortBy>Descending</sortBy>
        </flexComponentProperties>
        <flexComponentProperties>
            <reportColumn>Ringi__c.Subject__c</reportColumn>
        </flexComponentProperties>
        <flexComponentProperties>
            <reportColumn>Ringi__c.Status__c</reportColumn>
        </flexComponentProperties>
    </flexComponentProperties>
    <groupingSortProperties/>
    <header>滞留稟議一覧</header>
    <report>Ringi_Reports/Ringi_Stagnation_TOP10__x</report>
</dashboardComponent>
```

**ポイント**: `<reportColumn>Ringi__c.Status__c</reportColumn>` （`.` を使う）

---

## 発見方法

Report XML と同様、**UI で Dashboard を作成 → retrieve → 逆解析**が唯一の確実な方法。

### 手順

1. UI で Dashboard を 1 本だけ作成（Chart と FlexTable を混在させる）
2. Dashboard の DeveloperName 特定:

```bash
sf data query -q "SELECT DeveloperName, FolderName FROM Dashboard ORDER BY CreatedDate DESC LIMIT 5" -o <alias>
```

3. Retrieve:

```bash
sf project retrieve start -o <alias> -m "Dashboard:<FolderName>/<DevName>" --target-metadata-dir /tmp/ret
```

4. unzip して XML を読む:

```bash
unzip -o /tmp/ret/unpackaged.zip
cat /tmp/ret/unpackaged/dashboards/<FolderName>/<DevName>.dashboard
```

5. その XML 構造に合わせて残りの Dashboard XML を書く

---

## 横展開の注意

- **Dashboard XML は Report XML よりさらに罠が多い**
- 公式ドキュメントだけでは詰まる
- UI 作成 → retrieve → 逆解析 が鉄則

---

## 関連項目

- [Report XML の reportType と field の特殊記法](./Report%20XML%20の%20reportType%20と%20field%20の特殊記法.md)
