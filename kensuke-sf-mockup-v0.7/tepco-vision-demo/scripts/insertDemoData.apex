// TEPCO Vision Demo - Sample Data Loader
delete [SELECT Id FROM Swarm_Message__c];
delete [SELECT Id FROM Action_Step__c];
delete [SELECT Id FROM Substation_Alert__c];

Substation_Alert__c a = new Substation_Alert__c(
    Substation__c    = '新豊洲変電所 (地下式 275/154kV)',
    Equipment__c     = '1号主変圧器 / 300MVA / 2018運開',
    Severity__c      = 'Critical',
    Status__c        = 'IoT検知',
    H2_PPM__c        = 218,
    C2H2_PPM__c      = 12,
    Oil_Temp__c      = 68.4,
    Load_Rate__c     = 62,
    Households_Affected__c = 240000,
    Detected_At__c   = Datetime.now()
);
insert a;

List<Action_Step__c> steps = new List<Action_Step__c>{
    new Action_Step__c(Alert__c=a.Id, Sequence__c=1, System__c='SAP',   Title__c='SAP S/4HANA から予備部品を仮引当',
        Description__c='P/N: TR-CF-300-IK ・ 千葉資材センターに1セット確認 → 仮押え',
        Meta_Info__c='緊急便で本日22:00着 / 与信枠OK', Status__c='待機'),
    new Action_Step__c(Alert__c=a.Id, Sequence__c=2, System__c='DC',    Title__c='中央給電指令所 系統影響を予測',
        Description__c='本機停止時、新京葉線経由で迂回可能。富津火力 +30万kW焚き増し想定',
        Meta_Info__c='系統シミュレータ ・ 信頼度 96%', Status__c='待機'),
    new Action_Step__c(Alert__c=a.Id, Sequence__c=3, System__c='AWS',   Title__c='AWS 気象 + 系統データから施工ウィンドウ抽出',
        Description__c='明日 6/16 02:00–06:00、低負荷帯かつ降雨なし。地下立会作業に最適',
        Meta_Info__c='作業所要 4時間想定', Status__c='待機'),
    new Action_Step__c(Alert__c=a.Id, Sequence__c=4, System__c='M365',  Title__c='M365 保全第2班のスケジュール仮押え',
        Description__c='5名 全員空き ・ Exchange で仮ブロック設定済',
        Meta_Info__c='林氏 14:00 会議は代理回答候補を作成', Status__c='待機'),
    new Action_Step__c(Alert__c=a.Id, Sequence__c=5, System__c='Teams', Title__c='Teams 東芝技術担当との緊急会議発行',
        Description__c='中村氏宛 16:00 (60分) ・ 油中ガス分析サマリーを事前投稿',
        Meta_Info__c='同時通訳・録画自動オン', Status__c='待機')
};
insert steps;

Datetime base = Datetime.now();
List<Swarm_Message__c> msgs = new List<Swarm_Message__c>{
    new Swarm_Message__c(Alert__c=a.Id, Sequence__c=1, Sender_Name__c='Agentforce', Sender_Type__c='Agentforce',
        Sender_Role__c='', Sent_At__c=base.addMinutes(0),
        Body__c='このチャンネルを自動作成しました。新豊洲1号トランスの油中ガス異常を受け、関係者14名を自動招待しました。Salesforce レコードと双方向同期しています。',
        Attachment_Title__c='📌 ピン留め', Attachment_Body__c='油中ガス分析結果 ・ SAP 発注書 #5800-2026-0615-091 ・ Teams 招待 ・ 過去類似事例レポート'),
    new Swarm_Message__c(Alert__c=a.Id, Sequence__c=2, Sender_Name__c='渡辺 健', Sender_Type__c='Human',
        Sender_Role__c='中央給電指令所・主任給電員', Sent_At__c=base.addMinutes(1),
        Body__c='来ました。@Agentforce 1号機停止の場合、都心ループに与える影響を最新潮流で計算してくれる？富津火力の余力含めて。'),
    new Swarm_Message__c(Alert__c=a.Id, Sequence__c=3, Sender_Name__c='Agentforce', Sender_Type__c='Agentforce',
        Sent_At__c=base.addMinutes(1),
        Body__c='渡辺さん、計算しました。1号機停止で 154kV 母線の供給力 -240MW。以下の系統切替で停電を回避できます。',
        Attachment_Title__c='⚡ 系統切替プラン (信頼度 96%)',
        Attachment_Body__c='① 富津火力 #2号機 +30万kW (78→108万kW)\n② 新京葉線経由で 154kV 迂回 (損失+1.2%)\n③ 都心ループ南側から 80MW 逆潮\n④ 1号機解列 → 4時間保全 → 復旧'),
    new Swarm_Message__c(Alert__c=a.Id, Sequence__c=4, Sender_Name__c='渡辺 健', Sender_Type__c='Human',
        Sender_Role__c='中央給電指令所', Sent_At__c=base.addMinutes(4),
        Body__c='OK、これでいけそう。富津#2の燃料費の追加コストは？@Agentforce'),
    new Swarm_Message__c(Alert__c=a.Id, Sequence__c=5, Sender_Name__c='Agentforce', Sender_Type__c='Agentforce',
        Sent_At__c=base.addMinutes(4),
        Body__c='SAP 燃料管理から計算: LNG 追加消費 320トン ・ ¥4,200万 (4時間)。合計コスト ¥5.2億規模。緊急予算枠 ¥3億超過のため経営承認が必要です。'),
    new Swarm_Message__c(Alert__c=a.Id, Sequence__c=6, Sender_Name__c='松本 真理', Sender_Type__c='Human',
        Sender_Role__c='経営企画・リスク', Sent_At__c=base.addMinutes(5),
        Body__c='停電させた場合の損失と比較したいです。@Tableau Next ROI比較ダッシュボード作って。'),
    new Swarm_Message__c(Alert__c=a.Id, Sequence__c=7, Sender_Name__c='Tableau Next', Sender_Type__c='Tableau',
        Sent_At__c=base.addMinutes(5),
        Body__c='松本さん、作成しました。停電 vs 緊急対応の比較です。',
        Attachment_Title__c='📊 ROI比較: 停電 vs 緊急対応',
        Attachment_Body__c='▶ 停電許容: 想定損害 ¥84〜120億 (供給支障補償+顧客賠償+信頼毀損)\n▶ 緊急対応 (推奨): 追加コスト ¥5.2億 (燃料+部品+残業+メーカー)\n\nROI: 緊急対応で 16〜23倍の損失回避。社会的影響 (24万世帯停電) は許容不可。'),
    new Swarm_Message__c(Alert__c=a.Id, Sequence__c=8, Sender_Name__c='松本 真理', Sender_Type__c='Human',
        Sender_Role__c='経営企画', Sent_At__c=base.addMinutes(6),
        Body__c='これで判断は明確。@Agentforce 関常務にエスカレーション送って。Tableau ダッシュボード URL も。'),
    new Swarm_Message__c(Alert__c=a.Id, Sequence__c=9, Sender_Name__c='Agentforce', Sender_Type__c='Agentforce',
        Sent_At__c=base.addMinutes(6),
        Body__c='承知しました。関 常務のモバイル Slack に DM 送信中... ✓ 通知送信完了 (経企部長 / 広報部長にも CC)。Tableau ダッシュボード URL 同梱 (SSO)。想定回答時間: 7〜12分。')
};
insert msgs;

System.debug('Demo data inserted: alert=' + a.Id);
System.debug('URL: /lightning/r/Substation_Alert__c/' + a.Id + '/view');
