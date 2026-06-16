# Flow Orchestration の Decision で Stage Output を参照する書き方

## 概要

Flow Orchestration（Orchestrator タイプのフロー）で、Interactive Step (Screen Flow) の output を受け取り、Decision で分岐する実装パターン。

## 前提

- Interactive Step として呼び出される Screen Flow が output 変数を持っている
- 例: `Ringi_Approval_V2.flow-meta.xml` の `approvalOutcome` (String, isOutput=true)

## 実装パターン

### 1. Orchestrator 側で受け取り用変数を定義

```xml
<variables>
    <name>Stage2_Outcome</name>
    <dataType>String</dataType>
    <isCollection>false</isCollection>
    <isInput>false</isInput>
    <isOutput>false</isOutput>
</variables>
```

### 2. Interactive Step の outputParameters で変数に代入

```xml
<stageSteps>
    <name>Step_Department_Manager</name>
    <label>起案部長による承認</label>
    <actionName>Ringi_Approval_V2</actionName>
    <actionType>stepInteractive</actionType>
    <assignees>
        <assignee>
            <elementReference>AssigneeUsername</elementReference>
        </assignee>
        <assigneeType>User</assigneeType>
    </assignees>
    <inputParameters>
        <name>RingiId</name>
        <value>
            <elementReference>$Record.Id</elementReference>
        </value>
    </inputParameters>
    <outputParameters>
        <name>approvalOutcome</name>
        <assignToReference>Stage2_Outcome</assignToReference>
    </outputParameters>
    <requiresAsyncProcessing>false</requiresAsyncProcessing>
    <runAsUser>false</runAsUser>
    <shouldLock>false</shouldLock>
    <stepSubtype>InteractiveStep</stepSubtype>
</stageSteps>
```

### 3. Stage の connector で Decision に渡す

```xml
<orchestratedStages>
    <name>Stage_2_Department_Approval</name>
    <label>起案部承認</label>
    <locationX>176</locationX>
    <locationY>220</locationY>
    <connector>
        <targetReference>Decision_After_Stage2</targetReference>
    </connector>
    <exitConditionLogic>and</exitConditionLogic>
    <stageSteps>
        <!-- 上記 Step がここに入る -->
    </stageSteps>
</orchestratedStages>
```

### 4. Decision で変数を参照して分岐

```xml
<decisions>
    <name>Decision_After_Stage2</name>
    <label>起案部承認の結果判定</label>
    <locationX>176</locationX>
    <locationY>320</locationY>
    <defaultConnector>
        <targetReference>Stage_3_Main_Manager_Parallel</targetReference>
    </defaultConnector>
    <defaultConnectorLabel>承認（次へ）</defaultConnectorLabel>
    <rules>
        <name>Stage2_Is_Return</name>
        <conditionLogic>and</conditionLogic>
        <conditions>
            <leftValueReference>Stage2_Outcome</leftValueReference>
            <operator>EqualTo</operator>
            <rightValue>
                <stringValue>差し戻し</stringValue>
            </rightValue>
        </conditions>
        <connector>
            <targetReference>Stage_Return_To_Reception</targetReference>
        </connector>
        <label>差し戻し</label>
    </rules>
</decisions>
```

## 注意点

### 並列 Step の場合

複数の並列 Step が同じ Screen Flow を呼んでいても、**outputParameters は個別に設定できない**（共通の変数に最後に完了した Step の結果が入る）。

並列承認で各承認者の結果を個別に取得したい場合は、Step ごとに異なる変数を用意する必要がある。

例:
```xml
<stageSteps>
    <name>Step_Executive_A</name>
    <outputParameters>
        <name>approvalOutcome</name>
        <assignToReference>Stage4_Outcome_A</assignToReference>
    </outputParameters>
</stageSteps>
<stageSteps>
    <name>Step_Executive_B</name>
    <outputParameters>
        <name>approvalOutcome</name>
        <assignToReference>Stage4_Outcome_B</assignToReference>
    </outputParameters>
</stageSteps>
```

ただし、今回の実装では「並列承認のうち誰か1人でも差し戻しを選んだら全体を差し戻す」ロジックは組まず、**ステージ全体が完了した後に代表で1つの変数を参照**する設計にしている。

### Assignment ノードは不要

Screen Flow の output を Orchestrator 変数に入れるには、`outputParameters` だけで完結する。中間に Assignment ノードを挟む必要はない。

## キャンバス整列のコツ

Flow Builder でデモ時に綺麗に見せるため、locationX / locationY を揃える。

- 主軸（縦方向）: locationX = 176 固定
- Stage 間隔: locationY を 100 または 200 刻みで配置
- Decision は Stage の直後（Stage Y + 100）
- 差し戻し用 Stage は横にずらす（locationX = 400）

例:
```xml
<orchestratedStages>
    <name>Stage_1_Reception</name>
    <locationX>176</locationX>
    <locationY>100</locationY>
</orchestratedStages>
<orchestratedStages>
    <name>Stage_2_Department_Approval</name>
    <locationX>176</locationX>
    <locationY>220</locationY>
</orchestratedStages>
<decisions>
    <name>Decision_After_Stage2</name>
    <locationX>176</locationX>
    <locationY>320</locationY>
</decisions>
<orchestratedStages>
    <name>Stage_Return_To_Reception</name>
    <locationX>400</locationX>
    <locationY>300</locationY>
</orchestratedStages>
```

## 社長決裁スキップ分岐

金額条件で Stage をスキップする場合、Decision で `$Record` のフィールドを直接参照できる。

```xml
<decisions>
    <name>Decision_President_Required</name>
    <label>社長決裁要否判定</label>
    <rules>
        <name>President_Approval_Required</name>
        <conditionLogic>and</conditionLogic>
        <conditions>
            <leftValueReference>$Record.Ringi_Amount__c</leftValueReference>
            <operator>GreaterThanOrEqualTo</operator>
            <rightValue>
                <numberValue>10000000.0</numberValue>
            </rightValue>
        </conditions>
        <connector>
            <targetReference>Stage_5_President</targetReference>
        </connector>
        <label>社長決裁必要（1千万円以上）</label>
    </rules>
    <defaultConnector>
        <targetReference>Stage_6_Post_Notification</targetReference>
    </defaultConnector>
    <defaultConnectorLabel>社長決裁不要（1千万円未満）</defaultConnectorLabel>
</decisions>
```

## Flow Builder で開けないエラー

デプロイ直後に Flow Builder を開くと「現在このフローを開くことができません」エラーが出る場合がある。

- 原因: Orchestration Flow の複雑さ、または一時的な組織側のキャッシュ
- 対処:
  1. ブラウザをリロード
  2. 別の Flow を開いてから戻る
  3. Setup→Flows のリストから「有効化」ボタンを使う（Flow Builder を開かずに Activate 可能）
  4. 時間を置いて再度試す

## 参考

- プロジェクト: FlowOrchestrationDemo
- ファイル: `force-app/main/default/flows/Ringi_HQ_Approval_V2.flow-meta.xml`
- Screen Flow: `Ringi_Approval_V2.flow-meta.xml`
- 作業日: 2026-05-12
- 担当: cody@S-k9m2#4
