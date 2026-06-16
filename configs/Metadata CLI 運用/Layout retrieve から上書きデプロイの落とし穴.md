# Layout retrieve → 編集 → デプロイで既存項目を欠落させる事故

**取得元**: sf-create-objects スキル / 2026-05-11  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

新規作成したカスタム項目を既存ページレイアウトに追加するため、`sf project retrieve start --metadata "Layout:..."` で取得した XML を編集してデプロイする場合。

---

## 注意点

### 誤診されやすさ

- 「自分が追加した項目」だけが意識に上り、既存の `OwnerId` / 標準項目 / システム項目セクションを**消したまま**デプロイしてしまう事故が起こる
- デプロイは成功する（XML として valid）ので気付かない
- ユーザーが「あれ、所有者欄がなくなった」と気付くまでデモ環境で見逃される

### 真因

Layout XML は **「現状の完全なレイアウト定義」** を表現する形式。retrieve した XML を上書きデプロイすると、その XML に含まれない項目・セクション・関連リスト・ボタンは**全て削除**される（差分マージではなく全置換）。

特に retrieve 直後の `<layoutSections>` には以下が含まれる：

- システム項目セクション（`OwnerId`, `CreatedDate`, `LastModifiedDate` 等）
- カスタムリンクセクション
- 関連リスト（`<relatedLists>`）
- ハイライトパネル設定（`<summaryLayout>`）
- モバイルレイアウト設定（`<miniLayout>`）

これらをうっかり削ると、新規項目追加と引き換えに既存機能が壊れる。

---

## 対処

### 推奨手順

```bash
# 1. レイアウト名を厳密に確認（Layout 名は表示ラベルではなく developerName）
sf org list metadata --metadata-type Layout --target-org target-org \
  | grep ObjectName__c

# 2. retrieve（出力パスを明示）
sf project retrieve start \
  --metadata "Layout:ObjectName__c-Layout名" \
  --target-org target-org

# 3. retrieve 直後にバックアップを取る（事故時の復旧用）
cp force-app/main/default/layouts/ObjectName__c-Layout名.layout-meta.xml \
   /tmp/Layout-backup-$(date +%s).xml
```

### 編集時の鉄則

- **新規 `<layoutItems>` を既存 `<layoutColumns>` に追記**する形を取る
- セクション全体の置き換えではなく、**追記モード**で編集
- 既存の `<relatedLists>`, `<summaryLayout>`, `<miniLayout>`, `<layoutSections>` 全体は**触らない**
- 不要な空セクションを「整理」したくなっても、デモ動作確認まで保留

### デプロイ後の確認

- ブラウザで該当オブジェクトのレコードを開き、所有者・関連リスト・ハイライトパネルが残っているかを目視
- これは型チェックでは検出できない

---

## 複数レイアウト存在時の注意

レイアウトが複数ある場合（標準・カスタム・レコードタイプ別）、どれに追加するか**ユーザーに必ず確認**する。間違ったレイアウトに追加すると「項目が出てこない」とトラブルになる。

```bash
# 該当オブジェクトのレイアウト一覧
sf org list metadata --metadata-type Layout --target-org target-org \
  | grep ObjectName__c
```

---

## 関連項目

- [プロファイルとタブの同時デプロイ禁止](./プロファイルとタブの同時デプロイ禁止.md)
- [CustomObject searchLayouts 空タグの罠](./CustomObject%20searchLayouts%20空タグの罠.md)
