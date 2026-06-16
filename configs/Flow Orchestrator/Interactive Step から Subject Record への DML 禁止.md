# Interactive Step から Subject Record への DML 禁止

## 概要

Flow Orchestration の Interactive Step として呼ばれる Screen Flow の中で、
Orchestrator が管理する Subject Record に直接 `recordUpdates` / `recordCreates` を打ってはいけない。

## 症状

- WorkGuide の操作中に「このフローで未対応の障害が発生しました。フローを処理中に未対応の障害が発生しました。詳細は、組織のシステム管理者にお問い合わせください。」
- `FlowInterview` にエラーログが残らないため SOQL からは原因特定不可
- Deploy は Succeeded、フロー自体の構文エラーではないため気付きにくい

## 根本原因

Orchestration エンジンは Stage 完了時に Subject Record に内部 DML をかける。
Screen Flow（Interactive Step）内で同一レコードに DML を打つと **ロック衝突** が発生し、
"Unhandled Fault" として落ちる。

## 正しいパターン

### NG（Screen Flow 内に recordUpdates）

```
[Stage 1 Interactive Step]
    └─ Screen Flow: Reception_V2
        ├─ 画面表示
        └─ recordUpdates: Current_Stage__c = "20 起案部承認"  ← NG
```

### OK（次 Stage の Background Step で更新）

```
[Stage 1 Interactive Step]
    └─ Screen Flow: Reception_V2
        └─ 画面表示のみ（DML なし）

[Stage 2]
    ├─ stepBackground: Ringi_Advance_To_Stage2  ← AutoLaunchedFlow で更新
    │       └─ recordUpdates: Current_Stage__c = "20 起案部承認"
    └─ stepInteractive: ...
```

## 実装例（このプロジェクト）

- AutoLaunchedFlow: `Ringi_Advance_To_Stage2.flow-meta.xml`
  - `Ringi_Mark_Decided` と同パターン
  - 入力変数 `RingiId`（String, isInput=true）を受け取り `Current_Stage__c` を更新
- Orchestrator: `Ringi_HQ_Approval_V2.flow-meta.xml`
  - `Stage_2_Department_Approval` の `stageSteps` 先頭に `Step_Set_Stage2`（stepBackground）を追加

## Background Step の書き方（Orchestrator XML）

```xml
<stageSteps>
    <name>Step_Set_Stage2</name>
    <label>Stage 2 昇格（受付完了）</label>
    <actionName>Ringi_Advance_To_Stage2</actionName>
    <actionType>stepBackground</actionType>
    <canAssigneeEdit>false</canAssigneeEdit>
    <entryConditionLogic>and</entryConditionLogic>
    <exitConditionLogic>and</exitConditionLogic>
    <inputParameters>
        <name>RingiId</name>
        <value>
            <elementReference>$Record.Id</elementReference>
        </value>
    </inputParameters>
    <requiresAsyncProcessing>false</requiresAsyncProcessing>
    <runAsUser>false</runAsUser>
    <shouldLock>false</shouldLock>
    <stepSubtype>BackgroundStep</stepSubtype>
</stageSteps>
```

## 注意

- CLI デプロイ後は全フロー（AutoLaunchedFlow 含む）が Draft になる → Setup → Flows で手動 Activate 必須
- Activate 順序: 参照される Subflow → Orchestrator の順（依存関係あり）
- 発生確認: R-2026-00051「人事システム連携」WorkGuide（2026-05-08）
