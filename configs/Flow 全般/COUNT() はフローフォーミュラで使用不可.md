# COUNT() はフローフォーミュラで使用不可

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

AutoLaunched Flow のフォーミュラで `COUNT({!collectionVariable})` を使用した。

---

## 注意点

- Flow フォーミュラは**標準 Salesforce 計算式関数のサブセット**
- `COUNT()` は **SOQL 集計用**であり、Flow フォーミュラでは無効
- デプロイ自体は成功するが、Flow が `InvalidDraft` になり**アクティブ化できない**

---

## 対処

コレクションのサイズ判定は以下の方法で代替する。

### 方法 1: IF(ISNULL()) 方式（Get Records の getFirstRecordOnly=true と組み合わせ）

```xml
<!-- Get Records で最初の1件を取得 -->
<recordLookups>
    <name>Get_First_Record</name>
    <label>Get First Record</label>
    <object>Account</object>
    <getFirstRecordOnly>true</getFirstRecordOnly>
    <storeOutputAutomatically>true</storeOutputAutomatically>
</recordLookups>

<!-- Formula でチェック -->
<formulas>
    <name>HasRecords</name>
    <dataType>String</dataType>
    <expression>IF(ISNULL({!Get_First_Record.Id}), "なし", "あり")</expression>
</formulas>
```

### 方法 2: Loop で個数カウント

```xml
<!-- Number 型変数を用意 -->
<variables>
    <name>RecordCount</name>
    <dataType>Number</dataType>
    <scale>0</scale>
    <value>
        <numberValue>0</numberValue>
    </value>
</variables>

<!-- Loop で Collection を回してカウント -->
<loops>
    <name>Loop_Collection</name>
    <label>Loop Collection</label>
    <collectionReference>CollectionVariable</collectionReference>
    <iterationOrder>Asc</iterationOrder>
    <nextValueConnector>
        <targetReference>Increment_Count</targetReference>
    </nextValueConnector>
    <noMoreValuesConnector>
        <targetReference>Next_Step</targetReference>
    </noMoreValuesConnector>
</loops>

<!-- Assignment で +1 -->
<assignments>
    <name>Increment_Count</name>
    <label>Increment Count</label>
    <assignmentItems>
        <assignToReference>RecordCount</assignToReference>
        <operator>Add</operator>
        <value>
            <numberValue>1</numberValue>
        </value>
    </assignmentItems>
    <connector>
        <targetReference>Loop_Collection</targetReference>
    </connector>
</assignments>
```

### 方法 3: Apex 呼び出し（コレクションのサイズを返す）

```apex
public class FlowHelper {
    @InvocableMethod(label='Get Collection Size')
    public static List<Integer> getCollectionSize(List<List<SObject>> collections) {
        List<Integer> results = new List<Integer>();
        for (List<SObject> collection : collections) {
            results.add(collection == null ? 0 : collection.size());
        }
        return results;
    }
}
```

Flow から呼び出し:

```xml
<actionCalls>
    <name>Get_Collection_Size</name>
    <label>Get Collection Size</label>
    <actionName>FlowHelper</actionName>
    <actionType>apex</actionType>
    <inputParameters>
        <name>collections</name>
        <value>
            <elementReference>CollectionVariable</elementReference>
        </value>
    </inputParameters>
    <storeOutputAutomatically>true</storeOutputAutomatically>
</actionCalls>
```

---

## 関連項目

- [Loop 変数をフォーミュラで参照する注意](./Loop%20変数をフォーミュラで参照する注意.md)
