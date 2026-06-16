# GenAiFunction はソース形式デプロイ非対応（新規作成時）

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

カスタム Flow を Agent Action として登録するため `genAiFunctions/Xxx.genAiFunction-meta.xml` を作成してデプロイしようとした。

---

## 注意点

- `sf project deploy start --source-dir` / `--metadata` のいずれでも `Expected source files for type 'GenAiFunction'` エラーが発生し、**新規作成デプロイは不可**
- Agent Action の「新規作成」は Setup UI（Agentforce → Agent Actions → New → Flow）でのみ可能
- ただし、**既存の GenAiFunction に対する更新は CLI で可能**（2026-04-26 検証済）

---

## 対処

### 新規作成時（UI 必須）

1. Setup → Agentforce → Agent Actions → New
2. Type: Flow を選択し、対象 Flow を選択 → Next
   - **Flow が Active であること**（Draft だと IN/OUT 変数が検出されない）
3. 入力パラメータ（Flow の `isInput=true` 変数が自動検出される）
   - 各パラメータに「説明」「データ型」「入力が必要」「ユーザーから収集」を設定
4. 出力パラメータ（Flow の `isOutput=true` 変数が自動検出される）
   - 各パラメータに「説明」を設定
5. 保存

### UI で作成後の取得（ソース管理に含める）

```bash
sf project retrieve start --metadata "GenAiFunction:ApiName" -o <alias>
```

取得後は、ソース管理に含めて Git で管理できる。

---

### 既存の GenAiFunction の更新（CLI で可能）

**2026-04-26 検証済**: `.genAiFunction-meta.xml` レベルのフィールド（description / masterLabel / progressIndicatorMessage 等）は通常更新可能。

```bash
# .genAiFunction-meta.xml を編集
# 例: description / masterLabel を変更

# デプロイ
sf project deploy start --source-dir force-app/main/default/genAiFunctions/MyFunction -o <alias>
```

**結果**: `State: Changed` で即反映。

---

### schema.json 深部フィールドの変更（削除→再作成が必要）

`input/schema.json` や `output/schema.json` の深部フィールド（例: `copilotAction:isDisplayable` の切替、`required` 配列の変更）は `State: Unchanged` になる場合がある。その時は削除→再作成が必要。

手順は `.claude/commands/recreate-genai-function.md` 参照（プロジェクト固有のため、横展開時は手順を一般化）。

---

## GenAiPlugin への function 参照追加（Step 4）

UI で GenAiFunction を作成後、GenAiPlugin への紐付けは CLI で可能:

```xml
<GenAiPlugin xmlns="http://soap.sforce.com/2006/04/metadata">
    <!-- ... -->
    <genAiFunctions>
        <functionName>MyFunction</functionName>
    </genAiFunctions>
    <!-- ... -->
</GenAiPlugin>
```

```bash
sf project deploy start --source-dir force-app/main/default/genAiPlugins/MyPlugin.genAiPlugin-meta.xml -o <alias>
```

---

## 関連項目

- [GenAiPlugin の function 追加順序](./GenAiPlugin%20の%20function%20追加順序.md)
- [Agent Action は Flow が Active でないと IN/OUT 検出されない](./Agent%20Action%20は%20Flow%20が%20Active%20でないと%20IN%20OUT%20検出されない.md)
