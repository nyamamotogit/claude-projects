# sf CLI ログイン時の URL 変換（lightning.force.com → my.salesforce.com）

**取得元**: sf-create-objects スキル / 2026-05-11  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

ユーザーから提示された Salesforce 環境 URL をそのまま `--instance-url` に渡してログインしようとした場合：

```bash
sf org login web --instance-url https://example.lightning.force.com
```

---

## 注意点

### 誤診されやすさ

- 「ID/パスワードが間違っている」「環境が落ちている」と疑いがち
- ブラウザでは `lightning.force.com` で問題なく開けるので、URL 形式の違いに気付きにくい

### 真因

`*.lightning.force.com` は **Lightning Experience UI のフロントエンドホスト**であり、SOAP/Metadata API のエンドポイントではない。CLI ログインに必要なのは **My Domain ホスト**（`*.my.salesforce.com`）。

ユーザーがブラウザのアドレスバーから URL をコピーすると Lightning ホストになっているケースが多い。

---

## 対処

ログイン前に URL を変換する：

| ユーザー提示形式 | 変換後（`--instance-url` に渡す） |
|---|---|
| `https://example.lightning.force.com/...` | `https://example.my.salesforce.com` |
| `https://example--sandbox.sandbox.lightning.force.com/...` | `https://example--sandbox.sandbox.my.salesforce.com` |

```bash
# 正しい呼び出し
sf org login web \
  --alias target-org \
  --instance-url https://example.my.salesforce.com
```

### ホスト命名の覚え方

- `lightning.force.com` … ブラウザ UI 専用（Aura/LWC のレンダリング）
- `my.salesforce.com` … API/CLI のエンドポイント
- Sandbox は `--sandbox` サフィックスが両者に入る

---

## デモ環境固有の注意

- カスタムドメイン（`*.develop.my.salesforce.com` 等の Dev Org）はそのまま使える
- Scratch Org は `sf org login web` ではなく `sf org create scratch` の流れで自動的にエンドポイントが解決されるので変換不要
