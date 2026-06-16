# Interactive Step assignee 仕様

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

Flow Orchestration の Interactive Step で `Status=回覧中` のトリガ条件を満たしているにもかかわらず、起動時に `Invalid Resource reference` エラーが継続発生。Probe Flow での切り分けで、assignee の型と値の組合せが真因と判明。

---

## 注意点

### 誤った構文（動作しない）

```xml
<assignees>
    <assignee>
        <elementReference>$Record.OwnerId</elementReference>
    </assignee>
    <assigneeType>Resource</assigneeType>
</assignees>
```

- `<assigneeType>Resource</assigneeType>` + `<elementReference>$Record.OwnerId</elementReference>` の組合せは**動作しない**
- `Resource` type 自体は FlowStageStepAssignee の enum にあるが、Record ID フィールド（例: `005Ic...`）を直接参照することは期待されていない
- Flow Activate 時に「assignee 項目の割り当てられたユーザーは存在しないか、無効になっています」で弾かれる

### 正しい構文（動作する）

```xml
<assignees>
    <assignee>
        <elementReference>AssigneeUsername</elementReference>
    </assignee>
    <assigneeType>User</assigneeType>
</assignees>
```

- `<assigneeType>User</assigneeType>` で **Username 文字列**（例: `admin@example.com`）を渡す
- User ID（`005Ic...` 形式）を入れてはいけない
- SalesforceLabs サンプル（Deadline-Manager-for-Orchestrator / Data-Access-Request-Orchestration）で確認された正規パターン

---

## 対処

### 1. Flow に String 変数を用意

```xml
<variables>
    <name>AssigneeUsername</name>
    <dataType>String</dataType>
    <isInput>false</isInput>
    <isOutput>false</isOutput>
</variables>
```

**重要**: 格納する値は **User ID ではなく Username 文字列**（例: `admin@example.com`）

### 2. 各 Interactive Step で以下の XML に書き換え

```xml
<assignees>
    <assignee>
        <elementReference>AssigneeUsername</elementReference>
    </assignee>
    <assigneeType>User</assigneeType>
</assignees>
```

### 3. データドリブン化する場合

Flow 冒頭で User レコードを Get Records し、`User.Username` を String 変数にアサインしてから使う。

```xml
<recordLookups>
    <name>Get_Approver_Username</name>
    <filterLogic>and</filterLogic>
    <filters>
        <field>Id</field>
        <operator>EqualTo</operator>
        <value>
            <elementReference>$Record.OwnerId</elementReference>
        </value>
    </filters>
    <object>User</object>
    <outputAssignments>
        <assignToReference>AssigneeUsername</assignToReference>
        <field>Username</field>
    </outputAssignments>
</recordLookups>
```

---

## 切り分けの王道

最小 Orchestrator（Probe Flow）を作り、assignee の型・値パターンを 1 つずつ変えて Activate → 起動する。

エラー `Invalid Resource reference` は具体性が低いので、以下の両面で絞り込む:

1. **Apex Debug Log** の `FLOW_VALUE_ASSIGNMENT|Step_xxx|{Status=Error, StepError=...}`
2. **Tooling API PATCH 時のエラーメッセージ**（`INVALID_ASSIGNEE`, `RELATED_RECORD_REQUIRED_WORK_ACTION` など）

---

## 関連項目

- [ActionInput__RecordId は必須予約パラメータ](./ActionInput__RecordId%20は必須予約パラメータ.md)
- [UI Debug はトリガシミュレーション不可](./UI%20Debug%20はトリガシミュレーション不可.md)
