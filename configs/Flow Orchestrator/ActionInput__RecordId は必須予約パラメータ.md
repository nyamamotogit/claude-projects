# ActionInput__RecordId は必須予約パラメータ

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

Interactive Step の inputParameters から `ActionInput__RecordId` を削除して Active 化しようとすると、以下のエラーで弾かれる:

> "対話型ステップには、コンテキストレコードが必要です"  
> (extendedErrorCode: `RELATED_RECORD_REQUIRED_WORK_ACTION`)

---

## 注意点

- `ActionInput__RecordId` は **Salesforce 予約のパラメータ名**
- Screen Flow 側の変数定義には出現しないが、Orchestrator 側で必須
- Work Guide が「どのレコードを開いているか」を保持するために使われている
- これを削除したり置換したりしてはいけない

---

## 対処

Interactive Step ごとに以下を**必ず含める**:

```xml
<inputParameters>
    <name>ActionInput__RecordId</name>
    <value>
        <elementReference>$Record.Id</elementReference>
    </value>
</inputParameters>
```

### Background Step では不要

`stepSubtype=BackgroundStep` では `ActionInput__RecordId` は不要。

---

## 例: 完全な Interactive Step XML

```xml
<stageSteps>
    <name>Stage_1_Reception</name>
    <actionName>Ringi_Reception_V2</actionName>
    <actionType>flow</actionType>
    <assignees>
        <assignee>
            <elementReference>ReceptionQueueUsername</elementReference>
        </assignee>
        <assigneeType>User</assigneeType>
    </assignees>
    <canAssigneeEdit>false</canAssigneeEdit>
    <entryConditionLogic>and</entryConditionLogic>
    <exitConditionLogic>and</exitConditionLogic>
    <inputParameters>
        <name>ActionInput__RecordId</name>
        <value>
            <elementReference>$Record.Id</elementReference>
        </value>
    </inputParameters>
    <label>Stage 1: 部門受付</label>
    <requiresAsyncProcessing>false</requiresAsyncProcessing>
    <runAsUser>false</runAsUser>
    <shouldLock>false</shouldLock>
    <stageName>Stage_1</stageName>
    <stepSubtype>InteractiveStep</stepSubtype>
</stageSteps>
```

---

## 関連項目

- [Interactive Step assignee 仕様](./Interactive%20Step%20assignee%20仕様.md)
- [UI Debug はトリガシミュレーション不可](./UI%20Debug%20はトリガシミュレーション不可.md)
