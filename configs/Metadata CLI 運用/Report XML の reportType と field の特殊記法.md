# Report XML の reportType と field の特殊記法

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

CustomReportType を作成・デプロイ成功し、その上に Report を載せてデプロイしようとすると **`invalid report type`** エラーが継続発生。

- 標準 ReportType（`Opportunity` 等）では通る
- CustomReportType は `sf org list metadata -m ReportType` で存在確認可
- UI で「開発中 ↔ リリース済」切替保存を試しても解消しない

---

## 注意点

### 半日溶ける典型的ハマり方

- 公式ドキュメントの例が標準オブジェクトベースで、CustomReportType + カスタムフィールドの例が乏しい
- エラーメッセージが `invalid report type` だけで、Report XML のどこが悪いのか全く教えてくれない
- ReportType 側をいくら弄っても解決しない（真因は Report XML 側）

### 真因

Report XML の `<reportType>` および `<columns>/<field>` の**記述形式が特殊**。

---

## 対処

### 正しい記述形式

#### 1. `<reportType>` の記法

**CustomReportType の DeveloperName + `__c` サフィックック** が必要。

```xml
<!-- CustomReportType API 名が Ringi_Report_Type_V2 の場合 -->
<reportType>Ringi_Report_Type_V2__c</reportType>
```

**NG 例**:
- `<reportType>Ringi_Report_Type_V2</reportType>` （DeveloperName そのまま → 無視される）
- `<reportType>Ringi__c</reportType>` （オブジェクト名そのまま → CustomReportType が自動作成される前提、Salesforce は自動作成しない）

---

#### 2. `<field>` の記法

**`<オブジェクト API 名>$<フィールド API 名>` 形式**。

```xml
<columns>
    <field>Ringi__c$Name</field>
</columns>
<columns>
    <field>Ringi__c$Subject__c</field>
</columns>
```

**NG 例**:
- `<field>Subject__c</field>` （単独 → NG）
- `<field>Ringi__c.Subject__c</field>` （ドット区切り → NG）

---

#### 3. `<filter>` / `<sortColumn>` / `<timeFrameFilter>` も同じ形式

```xml
<filter>
    <criteriaItems>
        <column>Ringi__c$Status__c</column>
        <operator>equals</operator>
        <value>回覧中,協議中</value>
    </criteriaItems>
</filter>

<sortColumn>
    <column>Ringi__c$CreatedDate</column>
    <sortOrder>Desc</sortOrder>
</sortColumn>
```

---

#### 4. `<aggregates>/<calculatedFormula>` は**ドット区切り**が正解（例外）

```xml
<aggregates>
    <calculatedFormula>Ringi__c.Ringi_Amount__c:SUM</calculatedFormula>
    <datatype>currency</datatype>
    <developerName>FORMULA1</developerName>
    <isActive>true</isActive>
    <isCrossBlock>false</isCrossBlock>
    <masterLabel>稟議金額合計</masterLabel>
    <scale>0</scale>
</aggregates>
```

**ここだけ `$` ではなく `.` を使う。注意。**

---

## 発見方法（唯一の確実な正解 XML 入手方法）

UI で Report を 1 本手動作成 → retrieve して XML 構造を目視。

### 手順

1. デプロイしたい Report の「見た目」を UI で 1 本だけ作成
2. Report の DeveloperName 特定:

```bash
sf data query -q "SELECT DeveloperName, FolderName FROM Report ORDER BY CreatedDate DESC LIMIT 5" -o <alias>
```

3. Retrieve:

```bash
sf project retrieve start -o <alias> -m "Report:<FolderName>/<DevName>" --target-metadata-dir /tmp/ret
```

4. unzip して XML を読む:

```bash
unzip -o /tmp/ret/unpackaged.zip
cat /tmp/ret/unpackaged/reports/<FolderName>/<DevName>.report
```

5. その XML 構造に合わせて残りの Report XML を書く
6. まとめてデプロイ

---

## 正解 Report XML の完成形例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Report xmlns="http://soap.sforce.com/2006/04/metadata">
    <aggregates>
        <calculatedFormula>Ringi__c.Ringi_Amount__c:SUM</calculatedFormula>
        <datatype>currency</datatype>
        <developerName>FORMULA1</developerName>
        <isActive>true</isActive>
        <isCrossBlock>false</isCrossBlock>
        <masterLabel>稟議金額合計</masterLabel>
        <scale>0</scale>
    </aggregates>
    <columns>
        <field>Ringi__c$Name</field>
    </columns>
    <columns>
        <field>Ringi__c$Subject__c</field>
    </columns>
    <filter>
        <criteriaItems>
            <column>Ringi__c$Status__c</column>
            <operator>equals</operator>
            <value>回覧中,協議中</value>
        </criteriaItems>
    </filter>
    <format>Summary</format>
    <groupingsDown>
        <field>Ringi__c$Drafted_Department__c</field>
        <sortOrder>Asc</sortOrder>
    </groupingsDown>
    <name>稟議_部門別起案件数</name>
    <reportType>Ringi_Report_Type_V2__c</reportType>
    <scope>organization</scope>
</Report>
```

---

## 関連する org 側の罠

- CustomReportType 削除→再作成しても、Metadata API の参照索引がリフレッシュされない時がある
- UI で「開発中 → リリース済」切替が**効く場合と効かない場合がある**（org の状態による）
- 最終手段は「UI 作成→retrieve→逆解析」

---

## 関連項目

- [Dashboard XML の Chart / FlexTable で $ と . の混在](./Dashboard%20XML%20の%20Chart%20FlexTable%20で%20$%20と%20.%20の混在.md)
- [CustomObject searchLayouts 空タグの罠](./CustomObject%20searchLayouts%20空タグの罠.md)
