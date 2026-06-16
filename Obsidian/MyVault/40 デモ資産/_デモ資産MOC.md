# デモ資産 MOC

[[000 ホーム|← ホームへ]]

デモ本番で使うすべての資産を管理します。

## シナリオ

```dataview
TABLE tags, file.mtime as 更新日
FROM "40 デモ資産/シナリオ"
SORT file.mtime DESC
```

## 技術コンポーネント

```dataview
TABLE tags
FROM "40 デモ資産/技術コンポーネント"
SORT file.name ASC
```

## デモ環境

```dataview
LIST
FROM "40 デモ資産/デモ環境"
SORT file.name ASC
```
