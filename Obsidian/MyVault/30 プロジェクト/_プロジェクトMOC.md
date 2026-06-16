# プロジェクト MOC

[[000 ホーム|← ホームへ]]

## ステータス別

### 🟢 進行中

```dataview
TABLE status, due, tags
FROM "30 プロジェクト"
WHERE status = "進行中"
SORT due ASC
```

### 🟡 待機中

```dataview
TABLE status, due
FROM "30 プロジェクト"
WHERE status = "待機中"
SORT due ASC
```

### ✅ 完了

```dataview
TABLE status, file.mtime as 完了日
FROM "30 プロジェクト"
WHERE status = "完了"
SORT file.mtime DESC
LIMIT 5
```
