# lightning-record-picker (flowruntime:lookup) の出力属性は `recordId` であって `value` ではない

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-05-13
**Salesforce API**: 63.0
**構成**: 状況 → 注意点 → 対処

---

## 状況

Screen Flow に Reactive Lookup（`<extensionName>flowruntime:lookup</extensionName>`、UI 上は「ユーザー」「取引先」などの Lookup フィールド）を配置し、後続要素で選択結果（User Id 等）を参照するため `{!PickerName.value}` を使った。

deploy は成功するが Flow Builder で Validation エラー：

```
条件で「Load_User_Names_Loop.Id」次の文字列と一致する「Approver_Stage20_Picker.value」はサポートされません。
条件を削除するか、リソースと値のデータ型に互換性があることを確認してください。

要素に「Approver_Stage20_Picker.value」への無効な参照があります。
```

CLI deploy 時には XML スキーマがバリデーションで拾えず InvalidDraft 化。

---

## 注意点

- `flowruntime:lookup` の出力プロパティ名は **`recordId`**（型: String）
- `value` という属性は **存在しない**（一見直感的だが間違い）
- `recordId` は選択された Salesforce レコードの 18 桁 Id
- Lookup なので `Name` などのその他項目は別途 Get_Records で取得する必要がある

参考：lightning-record-picker（公式 LWC）の `value` 属性は **入力**側（初期選択）を指す。Flow から見たときの **出力**は `recordId` で参照する。混乱しやすい。

---

## 対処

### XML 一括置換

```bash
# Picker.value を Picker.recordId に一括置換
python3 -c "from pathlib import Path; p=Path('flows/MyFlow.flow-meta.xml'); p.write_text(p.read_text().replace('Picker.value', 'Picker.recordId'))"
```

### Flow XML の正しい記述例

```xml
<!-- Picker 配置 -->
<fields>
    <name>Approver_Stage20_Picker</name>
    <extensionName>flowruntime:lookup</extensionName>
    <fieldType>ComponentInstance</fieldType>
    <inputParameters>
        <name>label</name>
        <value><stringValue>起案部長</stringValue></value>
    </inputParameters>
    <inputParameters>
        <name>objectApiName</name>
        <value><stringValue>User</stringValue></value>
    </inputParameters>
    <inputParameters>
        <name>recordId</name>
        <value><elementReference>Default_Approver_Stage20</elementReference></value>
    </inputParameters>
    <isRequired>true</isRequired>
    <storeOutputAutomatically>true</storeOutputAutomatically>
</fields>

<!-- 後続で選択値を参照（recordId を使う） -->
<assignmentItems>
    <assignToReference>Update_Approvers_Loop.User__c</assignToReference>
    <operator>Assign</operator>
    <value>
        <elementReference>Approver_Stage20_Picker.recordId</elementReference>
    </value>
</assignmentItems>
```

### 設計上のヒント — 簡素化

Picker が 8 個に増殖して 1500 行の Flow になっているなら設計を見直す。`recordId` をそのまま該当 Ringi_Approver__c.User__c に書けば良いケースが多く、別 Loop で User.Name を再取得する必要はない（Get_Records 一回で User.Name までセットで取れる、または Picker の別出力でレコード全項目を取得する）。

---

## 関連項目

- [Metadata API で Draft Flow は Active 化できない](./Metadata%20API%20で%20Draft%20Flow%20は%20Active%20化できない.md)
- 公式: [lightning-record-picker component reference](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-picker)
