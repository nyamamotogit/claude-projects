# アーカイブ MOC

[[000 ホーム|← ホームへ]]

完了したプロジェクト・使わなくなったメモの保管場所。

```dataview
TABLE file.mtime as アーカイブ日
FROM "99 アーカイブ"
WHERE file.name != "_アーカイブMOC"
SORT file.mtime DESC
```
