# UI Debug はトリガシミュレーション不可

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

Orchestrator Flow の「デバッグ」ボタンで `$Record` を指定して実行しても、エントリ条件（例: `Status=回覧中`）を満たしていないと以下のメッセージで止まる:

> "トリガーレコードが条件の要件を満たしませんでした"

---

## 注意点

- Orchestrator は Screen Flow の Debug と違い、**トリガ条件（priorRecord vs $Record の変化）をシミュレートする UI が存在しない**
- デバッグオプションは**ロールバックモードの ON/OFF しかない**
- Flow Builder で「デバッグ」を押してレコードを指定しても、そのレコードが現在の状態で条件を満たすかどうかしか判定されない（レコード変化による起動シミュレーションはできない）

---

## 対処

### 対処法 1: トリガ条件を一時変更してデバッグ

Draft Flow のトリガ条件を、現実のレコード状態にマッチするよう一時変更する。

**例**: `Status=回覧中` が条件だが、テストレコードが `Status=起案中` の場合:

```xml
<!-- 元の条件 -->
<filters>
    <field>Status__c</field>
    <operator>EqualTo</operator>
    <value>
        <stringValue>回覧中</stringValue>
    </value>
</filters>

<!-- デバッグ用に一時変更 -->
<filters>
    <field>Status__c</field>
    <operator>EqualTo</operator>
    <value>
        <stringValue>起案中</stringValue>
    </value>
</filters>
```

デバッグ完了後、元の条件に戻す。

---

### 対処法 2: 変化判定を無効化

Draft の `doesRequireRecordChangedToMeetCriteria=false` に変更して「変化に関わらず毎回実行」にする。

```xml
<start>
    <doesRequireRecordChangedToMeetCriteria>false</doesRequireRecordChangedToMeetCriteria>
    <filterLogic>and</filterLogic>
    <filters>
        <field>Status__c</field>
        <operator>EqualTo</operator>
        <value>
            <stringValue>回覧中</stringValue>
        </value>
    </filters>
    <object>SampleObject__c</object>
    <recordTriggerType>Update</recordTriggerType>
    <triggerType>RecordAfterSave</triggerType>
</start>
```

**注意**: この設定は本番運用では推奨されない（無駄に Flow が起動する）ため、デバッグ専用。

---

### 対処法 3: SOQL で対象レコードを直接更新して Active Flow を起動

```bash
sf data update record -o <alias> -s SampleObject__c -w "Name='テストレコード'" -v "Status__c=回覧中"
```

**注意**: エラーロールバックの挙動に注意。Active Flow が異常終了すると、レコードが中途半端な状態で残る可能性がある。

---

## 推奨デバッグフロー

1. **Draft Flow で対処法 1 または 2 を使ってデバッグ**
2. **Active 化前に元の条件に戻す**
3. **Active 化後は、対処法 3（SOQL 更新）でテスト**

---

## 関連項目

- [Interactive Step assignee 仕様](./Interactive%20Step%20assignee%20仕様.md)
- [Metadata API で Draft Flow は Active 化できない](../Flow%20全般/Metadata%20API%20で%20Draft%20Flow%20は%20Active%20化できない.md)
