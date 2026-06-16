# Scheduled Flow の $Flow.CurrentDate は GMT 評価される罠

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-05-12
**最終更新**: 2026-05-13（Active 化忘れの相互作用を追記）
**Salesforce API**: 61.0
**構成**: 状況 → 注意点 → 対処 → 「修正したのに直らない」場合の切り分け

---

## 状況

Scheduled Flow（`triggerType=Scheduled`）の `<schedule>` で UTC 15:05 = JST 0:05 に毎日起動するように設定。
Flow 内で `$Flow.CurrentDate` を Task の ActivityDate に書き込んで「今日」のデモToDoに揃えたが、**翌朝確認すると前日の日付がセットされていた**。

```xml
<inputAssignments>
    <field>ActivityDate</field>
    <value>
        <elementReference>$Flow.CurrentDate</elementReference>
    </value>
</inputAssignments>
```

JST 0:05 起動時、UTC 上は前日 15:05。`$Flow.CurrentDate` は GMT 評価のため **前日の日付**を返す。組織のシステムタイムゾーンが Asia/Tokyo / Asia/Seoul であっても **Scheduled Flow 内の `$Flow.CurrentDate` は GMT 評価**。

確認方法（CronTrigger を Apex 経由でクエリ）:
```apex
List<CronTrigger> jobs = [SELECT Id, CronJobDetailId, NextFireTime, PreviousFireTime, State, TimesTriggered FROM CronTrigger];
for (CronTrigger ct : jobs) {
    CronJobDetail d = [SELECT Name, JobType FROM CronJobDetail WHERE Id = :ct.CronJobDetailId];
    System.debug(d.Name + ' state=' + ct.State + ' next=' + ct.NextFireTime + ' prev=' + ct.PreviousFireTime);
}
```
- `NextFireTime` / `PreviousFireTime` は UTC 表示。`Asia/Tokyo +9` で見ると JST。
- `TimesTriggered` が増えていれば確実に動いている

---

## 注意点

- `Date.today()` を Apex で実行するとユーザー TZ で評価されるため、**Apex Invocable と Scheduled Flow で挙動が異なる**
- `$Flow.CurrentDate` は GMT 評価、`Datetime.now()` は GMT 値で表示されるが演算は GMT
- スケジュール時刻を **JST 朝（UTC 21:00 前日 = JST 6:00）** にすれば UTC が前日になり、`$Flow.CurrentDate` も前日扱いになる → やはり JST 今日に揃わないので時刻変更だけでは解決しない
- 対処は **Formula で `+1` 日する** のが最もシンプル

---

## 対処

### Formula を追加

```xml
<formulas>
    <name>JstToday</name>
    <description>$Flow.CurrentDate は GMT 評価のため、JST 0:05 起動時に前日になる。+1 日して JST の今日付けに合わせる。</description>
    <dataType>Date</dataType>
    <expression>{!$Flow.CurrentDate} + 1</expression>
</formulas>
```

### Update で参照を Formula に切り替え

```xml
<inputAssignments>
    <field>ActivityDate</field>
    <value>
        <elementReference>JstToday</elementReference>
    </value>
</inputAssignments>
```

---

## 適用パターン

- **JST 0:00〜9:00 の時間帯に Scheduled Flow を起動する場合**、`$Flow.CurrentDate` をそのまま使うと前日扱いになる
- 起動時刻を JST 9:00 以降にする（UTC 0:00 以降）にずらすか、Formula で +1 日する
- デモ環境のように「日付を厳密に揃えたい」用途では Formula 補正が確実

## 別解（保険）

- **Apex Invocable で `Date.today()` を返す Action** を作って Subflow で呼ぶ → ユーザー TZ で評価されるが、Scheduled Flow には実行ユーザーの概念がないため `getUserId()` は Automated Process User となり TZ が予想と違う場合がある
- **Formula `+ 1` がもっとも単純で予測可能**

## 「Formula で +1 日に修正したのに翌朝もまだ前日のまま」の場合

GMT/JST 補正の Formula を追加した修正版を CLI deploy したのに、翌朝 ActivityDate が前日付けのまま更新されている場合、**バグは直っているが旧版が走り続けている可能性が高い**。

### 切り分け（30秒）

```bash
# Active と Latest を比較
sf data query --use-tooling-api -o <alias> -q "
  SELECT DeveloperName,
         ActiveVersion.VersionNumber,
         LatestVersion.VersionNumber,
         LatestVersion.Status
  FROM FlowDefinition
  WHERE DeveloperName = 'Demo_Reset_Daily_Todos'
"
```

`ActiveVersion=3 / LatestVersion=4 (Draft)` のように食い違いが出ていれば、**v4 は Activate されておらず CronTrigger は v3 を発火し続けている**。

### 仕組み

- CronTrigger は `<ApiName>-<バージョン番号>` 形式で **Active 版にのみ** 発行される
- CLI deploy で v4 を Draft 化しても CronTrigger は v3 のまま
- Setup → Flows で v4 を有効化（Activate）すると CronTrigger が v4 に切り替わり、翌日の発火から修正が効く

詳細: [Metadata API で Draft Flow は Active 化できない](../Flow%20全般/Metadata%20API%20で%20Draft%20Flow%20は%20Active%20化できない.md)

---

## 関連項目

- [Scheduled Flow 公式 Help](https://help.salesforce.com/s/articleView?id=platform.flow_concepts_trigger_schedule.htm)
- [Metadata API で Draft Flow は Active 化できない](../Flow%20全般/Metadata%20API%20で%20Draft%20Flow%20は%20Active%20化できない.md) — 修正してもデプロイしただけでは動かない罠
- 同じ罠: Apex Scheduled Job で `Date.today()` を呼ぶと System Context で `UserInfo.getTimeZone()` が GMT 扱いになることがある
