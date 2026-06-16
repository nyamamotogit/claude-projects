# Loop 変数をフォーミュラで参照する注意

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

`{!LoopElementName.FieldName}` を Flow フォーミュラ（変数定義レベル）で参照した。

---

## 注意点

- ループ外部からのフォーミュラ参照は構文上 valid 扱いだが、**実行時コンテキストに依存する**
- Loop の外で定義したフォーミュラから Loop 変数を参照すると、以下のリスクがある:
  - Loop が実行される前はフォーミュラが `null` または未定義値になる
  - Loop の実行順序に依存した挙動になり、デバッグしにくい
- 特にエラーが出ない場合もあるが、**意図しない挙動の原因になりやすい**

---

## 対処

ループ用フォーミュラは**必ずループ内でのみ使用される Assignment から参照する**こと。

### 誤った例（ループ外で定義）

```xml
<!-- Formula をトップレベルで定義 -->
<formulas>
    <name>CalculatedValue</name>
    <dataType>Number</dataType>
    <expression>{!LoopVar.Amount__c} * 1.1</expression>
</formulas>

<!-- Loop でループ変数を使う -->
<loops>
    <name>Loop_Records</name>
    <collectionReference>RecordCollection</collectionReference>
    <iterationOrder>Asc</iterationOrder>
    <nextValueConnector>
        <targetReference>Use_Formula</targetReference>
    </nextValueConnector>
</loops>

<!-- Assignment で Formula を使う -->
<assignments>
    <name>Use_Formula</name>
    <assignmentItems>
        <assignToReference>TotalAmount</assignToReference>
        <operator>Add</operator>
        <value>
            <elementReference>CalculatedValue</elementReference>
        </value>
    </assignmentItems>
</assignments>
```

**問題**: `CalculatedValue` がループ外で定義されているため、ループ開始前に評価される可能性がある。

---

### 正しい例（ループ内で直接計算）

```xml
<!-- Loop でループ変数を使う -->
<loops>
    <name>Loop_Records</name>
    <collectionReference>RecordCollection</collectionReference>
    <iterationOrder>Asc</iterationOrder>
    <nextValueConnector>
        <targetReference>Calculate_Inline</targetReference>
    </nextValueConnector>
</loops>

<!-- Assignment でインライン計算 -->
<assignments>
    <name>Calculate_Inline</name>
    <assignmentItems>
        <assignToReference>TotalAmount</assignToReference>
        <operator>Add</operator>
        <value>
            <elementReference>LoopVar.Amount__c</elementReference>
        </value>
    </assignmentItems>
    <connector>
        <targetReference>Loop_Records</targetReference>
    </connector>
</assignments>
```

または、Formula を使う場合は **Loop 内の Assignment で Formula 用変数を先にセット**してから使う:

```xml
<!-- ループ内で Formula 用の変数をセット -->
<assignments>
    <name>Set_Loop_Value</name>
    <assignmentItems>
        <assignToReference>CurrentAmount</assignToReference>
        <operator>Assign</operator>
        <value>
            <elementReference>LoopVar.Amount__c</elementReference>
        </value>
    </assignmentItems>
    <connector>
        <targetReference>Use_Formula</targetReference>
    </connector>
</assignments>

<!-- Formula は CurrentAmount を参照 -->
<formulas>
    <name>CalculatedValue</name>
    <dataType>Number</dataType>
    <expression>{!CurrentAmount} * 1.1</expression>
</formulas>
```

---

## 推奨設計

1. **ループ用の計算は、ループ内の Assignment で直接行う**
2. Formula を使う場合は、ループ内で一旦変数に格納してから Formula を評価する
3. ループ外で Formula を定義しない（コンテキスト依存のバグの温床）

---

## 関連項目

- [COUNT() はフローフォーミュラで使用不可](./COUNT()%20はフローフォーミュラで使用不可.md)
