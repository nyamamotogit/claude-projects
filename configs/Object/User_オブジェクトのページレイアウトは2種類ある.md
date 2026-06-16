# User オブジェクトのページレイアウトは2種類ある

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-05-12
**Salesforce API**: 63
**構成**: 状況 → 注意点 → 対処

---

## 状況

User オブジェクトに新規カスタム項目（`Delegate_Approver__c`、`Delegate_Start_Date__c`、`Delegate_End_Date__c`）を追加し、`User-User Layout.layout-meta.xml` に「代理承認設定」セクションを追加してデプロイした。
しかし、Lightning Experience の **User レコードページ（ユーザープロファイル画面）には項目が表示されなかった**。

---

## 注意点

### User オブジェクトには2種類のページレイアウトがある

| 種類 | 用途 | メタデータ名 | 編集場所 |
|---|---|---|---|
| **User Layout（標準ページレイアウト）** | クラシックや Setup の User Edit 画面 | `Layout:User-User Layout` | Setup → オブジェクトマネージャ → User → ページレイアウト |
| **ユーザープロファイルページレイアウト**（Profile-Based User Profile Layout） | **Lightning Experience のユーザープロファイル画面**（`/lightning/r/User/{id}/view`）で表示される画面 | `UserProfileLayout`（メタデータAPIでアクセスできない場合あり） | Setup → ユーザー → **ユーザー管理設定** → ユーザープロファイルページレイアウト |

### 落とし穴

- 一般的に「User Layout」を編集すれば項目が見えると思いがちだが、**Lightning UX では別の「ユーザープロファイルページレイアウト」が使われる**
- `User-User Layout.layout-meta.xml` を deploy しても Lightning UI には反映されない（クラシック/Setup編集画面にのみ反映される）
- FlexiPage（Lightning Page）も User オブジェクト用が存在するケースがあるが、デフォルトの User プロファイル画面は **標準 User Profile UI** であり FlexiPage ではない
- メタデータ型 `UserProfileLayout` は環境によって retrieve / deploy 可否が変わる

---

## 対処

### 正しい呼称と実体

- **`User Profile Layout`** = ユーザープロファイルページレイアウト = Lightning Experience の User レコードページ（`/lightning/r/User/{id}/view`）で表示されるレイアウト
- 単数の標準レイアウトとして存在し、Setup から編集する

### 手順（UI操作）

**Setup ナビゲーション**:
1. Setup → クイック検索「**ユーザー**」または「**User Profile**」
2. **オブジェクトマネージャ → User → ページレイアウト**ではなく、**専用の Setup ページ**で編集する
3. レイアウト名は「**User Profile Layout**」
4. 「ページレイアウトの編集」 → 必要な項目（例: `Delegate_Approver__c`、`Delegate_Start_Date__c`、`Delegate_End_Date__c`）を配置 → 保存
5. ブラウザ再読み込みで User プロファイル画面に項目が表示される

### CLI / API 制限

- `sf project retrieve start --metadata UserProfileLayout` は **sf CLI Registry に未登録**でエラー（`Missing metadata type definition in registry for id 'UserProfileLayout'`）
- Tooling API でも `Layout` クエリで User の Layout は **`User Layout` 1件しか返らない**ことがあり、`User Profile Layout` は別のメタデータ型として隠れている
- 結論: **CLI/API では編集できない。UI 操作のみで完結させる**

### 検証

- 対象ユーザー（例: 布浪 応太郎）の Lightning ユーザープロファイル画面（`/lightning/r/User/{id}/view`）を開く
- 「詳細」タブで追加した項目セクションが表示されるか確認
- 表示されない場合は、ブラウザキャッシュ → Setup の保存反映を疑う

### 委譲先（Claude が単独で完結できないとき）

UI 操作が必須のため、メタデータ追加（`Delegate_*` 等）は CLI で完結できるが、**ページレイアウトへの配置はユーザーに依頼するか、Playwright MCP で実画面を操作する**。

UI 操作で迷ったら以下を順に試す:
1. Setup クイック検索「ユーザー」→ プロファイル系メニュー
2. URL: `/lightning/setup/EnhancedUserProfileLayouts/home` 等の Setup パス
3. オブジェクトマネージャ → User → 関連リスト「ページレイアウト」

---

## 関連

- `feedback_render_verification.md`（render verification: deploy 後は実画面確認）
- 同じ罠: ユーザー編集画面（User Layout で編集する画面）と、ユーザープロファイル画面（読み取り専用の Lightning UI）が**別レイアウト**であることを忘れて時間を溶かしやすい
