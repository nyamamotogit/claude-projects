import { LightningElement, track } from 'lwc';

const IOT_DATA = {
    h2:   { name: '水素濃度推移 (過去72時間 ・ 5分間隔)', color: '#22d3ee', points: [[0,90],[60,89],[120,90],[180,88],[240,89],[300,87],[360,86],[420,82],[480,68],[520,42],[560,22],[600,15]], popText: '218ppm ⚠', popY: 15 },
    c2h2: { name: 'アセチレン推移 (過去72時間)', color: '#ff6b6b', points: [[0,100],[60,100],[120,100],[180,100],[240,100],[300,100],[360,100],[420,98],[480,80],[520,55],[560,32],[600,20]], popText: '12ppm 検出', popY: 20 },
    temp: { name: '油温推移 (過去72時間)', color: '#fbbf24', points: [[0,72],[60,70],[120,71],[180,69],[240,68],[300,66],[360,63],[420,58],[480,52],[520,46],[560,42],[600,38]], popText: '68.4℃', popY: 38 },
    load: { name: '負荷率推移 (過去72時間)', color: '#94a3b8', points: [[0,55],[60,58],[120,52],[180,60],[240,50],[300,55],[360,53],[420,52],[480,54],[520,53],[560,55],[600,52]], popText: '62%', popY: 52 }
};

const PATH_STEPS_DEF = [
    { id: 1, label: 'IoT検知', status: 'complete', guidance: 'AWS IoT Core DGA-MON-1F-Aセンサーより油中ガス(H₂・C₂H₂)の異常上昇を検知。センサーデータの確認と初期トリアージを実施してください。', checks: [{id:'1a',text:'センサー生データを確認済'},{id:'1b',text:'警報閾値超過を確認済'},{id:'1c',text:'誤報・センサー異常ではないことを確認済'},{id:'1d',text:'アラートレコードを起票済'}] },
    { id: 2, label: 'AI診断', status: 'current', guidance: 'Agentforceが過去類似事例・物理パラメータ・系統影響を横断分析します。Duval三角形プロットでD1(低エネルギー放電)領域を確認。24万世帯への影響を考慮し緊急対応を推奨します。', checks: [{id:'2a',text:'Agentforce 起動・横断分析完了'},{id:'2b',text:'過去類似事例との照合完了 (一致度89%)'},{id:'2c',text:'系統影響シミュレーション完了'},{id:'2d',text:'対応プラン5ステップを確認・承認済'}] },
    { id: 3, label: '部品手配', status: '', guidance: 'SAP S/4HANAで予備品(P/N: TR-CF-300-IK)の在庫確認と緊急発注を実施します。千葉資材センターに1セット確認済み。緊急便で本日22:00着の手配が完了しています。', checks: [{id:'3a',text:'SAP在庫照会完了 (千葉資材1セット確認)'},{id:'3b',text:'緊急発注・仮引当完了'},{id:'3c',text:'与信枠確認完了 (¥1,840万 枠内)'},{id:'3d',text:'配送手配完了 (22:00着)'}] },
    { id: 4, label: '作業班手配', status: '', guidance: 'M365 Exchangeで保全第2班(5名)の6/16 02:00-06:00スケジュールを確保します。林氏の14:00会議はCopilotで代理回答を作成済み。東芝技術担当との16:00 Teams会議も発行済みです。', checks: [{id:'4a',text:'保全第2班5名 スケジュール確保済'},{id:'4b',text:'東芝 中村氏 Teams会議 16:00 確定'},{id:'4c',text:'現場詰所・会議室予約完了'},{id:'4d',text:'安全確認書類準備済'}] },
    { id: 5, label: 'メーカー召集', status: '', guidance: '東芝エネルギーシステムズへ緊急技術支援を要請します。中村技術主幹が6/16 02:00の現場立会を確認済み。過去のメンテ履歴・3D設備モデルをSharePointで事前共有します。', checks: [{id:'5a',text:'東芝 中村氏 立会確認済'},{id:'5b',text:'技術資料 SharePoint共有完了'},{id:'5c',text:'緊急技術支援契約確認済'}] },
    { id: 6, label: '対応実施', status: '', guidance: '6/16 02:00より系統切替(富津火力+30万kW・新京葉線迂回)を実施後、1号機を解列し保全作業を開始します。絶縁紙・冷却ファン交換の標準作業手順(SOP)に従って実施します。', checks: [{id:'6a',text:'系統切替完了・供給維持確認'},{id:'6b',text:'1号機解列完了'},{id:'6c',text:'絶縁紙・冷却ファン交換完了'},{id:'6d',text:'油中ガス再採取・試験完了'}] },
    { id: 7, label: '復旧確認', status: '', guidance: '修理後の油中ガス分析でH₂・C₂H₂が正常値に戻ったことを確認してから復電します。監査ログをSalesforceに永続記録し、再発防止策を稟議として起票します。', checks: [{id:'7a',text:'油中ガス再分析 正常値確認'},{id:'7b',text:'1号機復電・系統正常化確認'},{id:'7c',text:'監査ログ Salesforce記録済'},{id:'7d',text:'再発防止稟議 起票済'}] }
];

const SLACK_MESSAGES = [
    { id:2, name:'Agentforce', isApp:true, role:'', avatar:'https://ui-avatars.com/api/?name=AF&background=0070d2&color=fff', time:'13:43', html:`渡辺さん、計算しました。<strong>1号機停止で 154kV 母線の供給力 -240MW</strong>。以下の系統切替で<strong>停電を回避</strong>できます:<div class="slack-attach"><div class="slack-attach-title">⚡ 系統切替プラン</div><div class="slack-attach-meta">AWS 系統シミュレータ ・ 信頼度 96%</div><div class="slack-attach-body"><strong>① 富津火力 #2号機 +30万kW</strong><br/><strong>② 新京葉線経由で 154kV 迂回</strong><br/><strong>③ 都心ループ南側から 80MW 逆潮</strong><br/><strong>④ 1号機解列 → 4時間保全 → 復旧</strong></div></div>` },
    { id:3, name:'渡辺 健', isApp:false, role:'', avatar:'https://ui-avatars.com/api/?name=渡辺+健&background=2eb67d&color=fff', time:'13:46', html:`OK、これでいけそう。富津#2の燃料費の追加コストは？ <span class="slack-mention">@Agentforce</span>` },
    { id:4, name:'Agentforce', isApp:true, role:'', avatar:'https://ui-avatars.com/api/?name=AF&background=0070d2&color=fff', time:'13:46', html:`SAP 燃料管理から計算: <strong>LNG 追加消費 320トン ・ ¥4,200万 (4時間)</strong>。<strong>合計コスト ¥5.2億規模</strong>。<strong>緊急予算枠 ¥3億超過のため経営承認が必要</strong>です。` },
    { id:5, name:'松本 真理', isApp:false, role:'経営企画・リスク', avatar:'https://ui-avatars.com/api/?name=松本+真理&background=ecb22e&color=fff', time:'13:47', html:`停電させた場合の損失と比較したいです。<span class="slack-mention">@Tableau Next</span> ROI比較ダッシュボード作って。` },
    { id:6, name:'Tableau Next', isApp:true, role:'', avatar:'https://ui-avatars.com/api/?name=TB&background=1f447e&color=fff', time:'13:47', html:`作成しました。<strong>停電 vs 緊急対応</strong>の比較です。<div class="slack-attach"><div class="slack-attach-title">📊 ROI比較: 停電 vs 緊急対応</div><div class="slack-attach-body"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div style="padding:8px;background:#fde4e4;border-radius:4px;"><strong style="color:#ba0517;">停電許容: ¥84〜120億</strong></div><div style="padding:8px;background:#def6e6;border-radius:4px;"><strong style="color:#04844b;">緊急対応: ¥5.2億</strong></div></div><div style="margin-top:8px;font-size:.75rem;">ROI: 緊急対応で <strong>16〜23倍の損失回避</strong></div></div></div>` },
    { id:7, name:'松本 真理', isApp:false, role:'', avatar:'https://ui-avatars.com/api/?name=松本+真理&background=ecb22e&color=fff', time:'13:48', html:`これで判断は明確。<span class="slack-mention">@Agentforce</span> 関常務にエスカレーション送って。` },
    { id:8, name:'Agentforce', isApp:true, role:'', avatar:'https://ui-avatars.com/api/?name=AF&background=0070d2&color=fff', time:'13:48', html:`承知しました。関 常務のモバイル Slack に DM 送信中...<div style="margin-top:6px;padding:6px 10px;background:#e0f0ff;border-radius:4px;font-size:.75rem;">✓ 関 常務に通知送信 (13:48:22)<br/>✓ 経企部長 / 広報部長にも CC<br/>✓ Tableau ダッシュボード URL 同梱<br/>✓ 想定回答時間: 7〜12分</div>` }
];

const STEP_DETAILS = {
    1: { title:'SAP S/4HANA ・ 予備品仮引当', sub:'PR 5800-2026-0615-091 (ドラフト)', html:`<h4>📦 品目情報</h4><table><tr><td>P/N</td><td>TR-CF-300-IK</td></tr><tr><td>品名</td><td>絶縁紙キット + 冷却ファンモーター</td></tr><tr><td>適用機器</td><td>300MVA級 主変圧器</td></tr><tr><td>メーカー</td><td>東芝エネルギーシステムズ</td></tr></table><h4>🏬 在庫照会結果</h4><table><tr><td>千葉資材センター</td><td style="color:#04844b;">✓ 1セット (仮押え)</td></tr><tr><td>鶴見資材センター</td><td>1セット (予備候補)</td></tr><tr><td>横浜EC倉庫</td><td>0 (取寄せ7日)</td></tr></table><h4>💰 コスト・与信</h4><table><tr><td>金額</td><td>¥ 1,840万</td></tr><tr><td>緊急便費用</td><td>¥ 32万 (含む)</td></tr><tr><td>与信</td><td style="color:#04844b;font-weight:700;">✓ 枠内 OK</td></tr></table>` },
    2: { title:'系統運用シミュレーション', sub:'新豊洲1号機 解列時の潮流変化', html:`<h4>⚡ 影響インパクト</h4><table><tr><td>停止電力</td><td>240MW (300MVA × 0.8)</td></tr><tr><td>影響範囲</td><td>中央/港/江東 24万世帯</td></tr><tr><td>連鎖リスク</td><td style="color:#ba0517;font-weight:700;">放置で 62万世帯</td></tr></table><h4>🔄 迂回プラン</h4><ul><li>富津火力 #2号機 +30万kW</li><li>新京葉線 154kV 迂回 (損失+1.2%)</li><li>都心ループ南側から 80MW 逆潮</li></ul><h4>📊 信頼度</h4><table><tr><td>シミュレーション</td><td>96% (10,000試行)</td></tr><tr><td>過去類似切替実績</td><td>3件すべて成功</td></tr></table>` },
    3: { title:'施工ウィンドウ最適化', sub:'気象 + 負荷予測 + 設備停止可能性', html:`<h4>📅 最適ウィンドウ</h4><table><tr><td>第1候補</td><td><strong>2026/06/16 02:00–06:00</strong></td></tr><tr><td>第2候補</td><td>06/17 03:00–07:00</td></tr></table><h4>🌤️ 気象</h4><table><tr><td>降水確率</td><td>2% (晴)</td></tr><tr><td>地下浸水リスク</td><td style="color:#04844b;">低</td></tr></table><h4>⏱ 作業内訳</h4><ul><li>準備・系統切替: 30分</li><li>絶縁紙・冷却ファン交換: 2時間30分</li><li>油中ガス再採取・試験: 45分</li><li>復電・確認: 15分</li></ul>` },
    4: { title:'M365 Exchange ・ チーム編成', sub:'東京ネットワークセンター 保全第2班', html:`<h4>👥 メンバー構成 (5名)</h4><table><tr><td>大山 剛</td><td>班長 / 高圧変電 経験18年</td></tr><tr><td>田中 慎一</td><td>変圧器スペシャリスト</td></tr><tr><td>佐藤 直樹</td><td>絶縁油試験 認定資格</td></tr><tr><td>川村 玲奈</td><td>系統切替オペレーション</td></tr><tr><td>林 達也</td><td>地下作業 / 安全管理</td></tr></table><h4>📅 6/16 02:00-06:00 空き</h4><table><tr><td>全5名</td><td style="color:#04844b;">✓ 仮押え済</td></tr></table>` },
    5: { title:'Teams 緊急技術会議', sub:'東芝エネルギーシステムズ 立会調整', html:`<h4>📞 会議概要</h4><table><tr><td>件名</td><td>緊急: 新豊洲1号トランス DGA 異常</td></tr><tr><td>日時</td><td>本日 16:00 – 17:00</td></tr></table><h4>👥 参加者</h4><ul><li><strong>中村 健司</strong> (東芝 変圧器技術主幹)</li><li>佐々木 雅也 (TEPCO 保全担当)</li><li>大山 剛 (TEPCO 保全2班長)</li><li>Agentforce (録画要約)</li></ul>` }
};

const DS_TILES_DEF = [
    { id:1, icon:'SAP', title:'SAP S/4HANA', desc:'稟議 RNG-2026-0615-EM01 → 承認済 / 部品出庫オーダー連動', iconStyle:'background:#0073e6;', shown:false },
    { id:2, icon:'SLK', title:'Slack 現場通知', desc:'「常務承認 → 作業開始」を #緊急-新豊洲 に投稿', iconStyle:'background:#4a154b;', shown:false },
    { id:3, icon:'中給', title:'中央給電指令所', desc:'系統切替プラン → 実行待機モード ・ 02:00 自動起動', iconStyle:'background:#032d60;', shown:false },
    { id:4, icon:'M365', title:'広報草案', desc:'Copilot がプレスリリース・対外Q&A 草案 → 広報部レビュー', iconStyle:'background:#d83b01;', shown:false },
    { id:5, icon:'TM', title:'Teams 招集', desc:'東芝 中村氏含む14名に作業開始を通知', iconStyle:'background:#6264a7;', shown:false }
];

export default class TepcoVisionDemo extends LightningElement {
    @track currentScene = 1;
    @track currentIotMetric = 'h2';
    @track currentChartName = IOT_DATA.h2.name;
    @track afLaunched = false;
    @track showPreAfCard = true;
    @track showActionPlan = false;
    @track showInsightCard = false;
    @track afConfidence = '分析中...';
    @track afPanelOpen = false;
    @track afMessages = [];
    @track executeDisabled = false;
    @track executeAllDone = false;
    @track actionSteps = [];
    @track pathSteps = [];
    @track activePathStepId = null;
    @track showPathDetail = false;
    @track slackProgress = 2;
    @track visibleSlackMsgs = [];
    @track slackNextLabel = '▶ 富津火力 焚き増しプランを表示';
    @track showEscalateBtn = false;
    @track sekiStatusText = '待機';
    @track sekiStatusClass = 'pill pill-orange';
    @track showMobileSlack = true;
    @track showMobileTableau2 = false;
    @track showMobileResult = false;
    @track blackoutBarWidth = 0;
    @track emergencyBarWidth = 0;
    @track heatmapActive = false;
    @track showStepModal = false;
    @track modalTitle = '';
    @track modalSub = '';
    @track demoHelperClass = 'demo-helper';
    _dsTilesData = JSON.parse(JSON.stringify(DS_TILES_DEF));
    _pathChecks = {};
    afMsgIdCounter = 0;

    connectedCallback() {
        this._initActionSteps();
        this._initPathSteps();
        window.addEventListener('keydown', this._onKey.bind(this));
        setTimeout(() => {
            this._toast('danger', '⚠ AWS IoT が異常検知', '新豊洲変電所 1号トランス・絶縁油中ガス', 5000);
            this._helper('💡 → キー で進む / ← キー で戻る、またはボタンをクリック');
        }, 800);
    }
    disconnectedCallback() { window.removeEventListener('keydown', this._onKey.bind(this)); }

    renderedCallback() {
        this._renderChart();
        this._renderAfMessages();
        this._renderSlackMessages();
        this._renderModalContent();
        this._renderRiskChart();
    }

    _initActionSteps() {
        this.actionSteps = [
            { id:1, num:'1', source:'SAP', badgeClass:'src-badge src-sap', title:'S/4HANA から予備部品を仮引当', desc:'P/N: TR-CF-300-IK ・ 千葉資材センターに1セット確認 → 仮押え', meta:'緊急便で本日22:00着 / 与信枠OK', pillText:'待機', stepClass:'action-step', numClass:'action-step-num', pillClass:'action-step-pill pill-orange' },
            { id:2, num:'2', source:'中央給電指令所', badgeClass:'src-badge src-dc', title:'系統影響を予測', desc:'本機停止時、新京葉線経由で迂回可能。富津火力 +30万kW焚き増し想定', meta:'系統シミュレータ ・ 信頼度 96%', pillText:'待機', stepClass:'action-step', numClass:'action-step-num', pillClass:'action-step-pill pill-orange' },
            { id:3, num:'3', source:'AWS', badgeClass:'src-badge src-aws', title:'気象 + 系統データから施工ウィンドウ抽出', desc:'6/16 02:00–06:00、低負荷帯かつ降雨なし', meta:'作業所要 4時間想定', pillText:'待機', stepClass:'action-step', numClass:'action-step-num', pillClass:'action-step-pill pill-orange' },
            { id:4, num:'4', source:'M365', badgeClass:'src-badge src-m365', title:'保全第2班のスケジュール仮押え', desc:'5名 全員空き ・ Exchange で仮ブロック設定済', meta:'林氏 14:00 会議は代理回答候補を作成', pillText:'待機', stepClass:'action-step', numClass:'action-step-num', pillClass:'action-step-pill pill-orange' },
            { id:5, num:'5', source:'Teams', badgeClass:'src-badge src-teams', title:'東芝技術担当との緊急会議発行', desc:'中村氏宛 16:00 (60分) ・ 油中ガス分析サマリーを事前投稿', meta:'同時通訳・録画自動オン', pillText:'待機', stepClass:'action-step', numClass:'action-step-num', pillClass:'action-step-pill pill-orange' }
        ];
    }

    _initPathSteps() {
        PATH_STEPS_DEF.forEach(s => {
            this._pathChecks[s.id] = s.checks.reduce((acc, c) => { acc[c.id] = false; return acc; }, {});
        });
        this._rebuildPathSteps();
    }

    _rebuildPathSteps() {
        this.pathSteps = PATH_STEPS_DEF.map(s => ({
            ...s,
            cls: `sf-path-step${s.status === 'complete' ? ' is-complete' : s.status === 'current' ? ' is-current' : ''}${this.activePathStepId === s.id ? ' is-active-detail' : ''}`
        }));
    }

    get activePathStep() {
        if (!this.activePathStepId) return null;
        const def = PATH_STEPS_DEF.find(s => s.id === this.activePathStepId);
        if (!def) return null;
        const checksState = this._pathChecks[def.id] || {};
        return {
            ...def,
            checks: def.checks.map(c => ({
                ...c,
                mark: checksState[c.id] ? '✓' : '',
                rowCls: `chk-row${checksState[c.id] ? ' checked' : ''}`
            }))
        };
    }

    // GETTERS
    get scene1Class() { return `scene${this.currentScene === 1 ? ' is-active' : ''}`; }
    get scene2Class() { return `scene${this.currentScene === 2 ? ' is-active' : ''}`; }
    get scene3Class() { return `scene${this.currentScene === 3 ? ' is-active' : ''}`; }
    get afPanelClass() { return `af-panel${this.afPanelOpen ? ' open' : ''}`; }
    get iotH2Cls() { return `iot-stat alert${this.currentIotMetric === 'h2' ? ' sel' : ''}`; }
    get iotC2h2Cls() { return `iot-stat alert${this.currentIotMetric === 'c2h2' ? ' sel' : ''}`; }
    get iotTempCls() { return `iot-stat${this.currentIotMetric === 'temp' ? ' sel' : ''}`; }
    get iotLoadCls() { return `iot-stat${this.currentIotMetric === 'load' ? ' sel' : ''}`; }
    get executeNotDone() { return !this.executeAllDone; }
    get blackoutBarStyle() { return `width:${this.blackoutBarWidth}%`; }
    get emergencyBarStyle() { return `width:${this.emergencyBarWidth}%`; }
    get hmChiyodaCls() { return `hm-cell orange${this.heatmapActive ? ' on' : ''}`; }
    get hmChuoCls() { return `hm-cell red${this.heatmapActive ? ' on' : ''}`; }
    get hmKotoCls() { return `hm-cell red${this.heatmapActive ? ' on' : ''}`; }
    get hmShinjukuCls() { return `hm-cell yellow${this.heatmapActive ? ' on' : ''}`; }
    get hmMinatoCls() { return `hm-cell red${this.heatmapActive ? ' on' : ''}`; }
    get hmShibuyaCls() { return `hm-cell yellow${this.heatmapActive ? ' on' : ''}`; }
    get dsTiles() {
        return this._dsTilesData.map(t => ({ ...t, tileClass: `ds-tile${t.shown ? ' show' : ''}` }));
    }

    // PATH
    clickPath(event) {
        const sid = parseInt(event.currentTarget.dataset.stepid, 10);
        if (this.activePathStepId === sid && this.showPathDetail) {
            this.showPathDetail = false;
            this.activePathStepId = null;
        } else {
            this.activePathStepId = sid;
            this.showPathDetail = true;
        }
        this._rebuildPathSteps();
    }
    closePathDetail() {
        this.showPathDetail = false;
        this.activePathStepId = null;
        this._rebuildPathSteps();
    }
    toggleCheck(event) {
        const cid = event.currentTarget.dataset.chkid;
        const sid = parseInt(event.currentTarget.dataset.stepid, 10);
        if (!this._pathChecks[sid]) this._pathChecks[sid] = {};
        this._pathChecks[sid][cid] = !this._pathChecks[sid][cid];
        // Force reactive update
        this.activePathStepId = null;
        this.activePathStepId = sid;
    }

    // IOT
    selectH2() { this._selectMetric('h2'); }
    selectC2h2() { this._selectMetric('c2h2'); }
    selectTemp() { this._selectMetric('temp'); }
    selectLoad() { this._selectMetric('load'); }
    _selectMetric(m) { this.currentIotMetric = m; this.currentChartName = IOT_DATA[m].name; setTimeout(() => this._renderChart(), 50); }
    redrawChart() { this._renderChart(); }

    _renderChart() {
        const c = this.refs.chartContainer;
        if (!c) return;
        const d = IOT_DATA[this.currentIotMetric];
        const pts = d.points.map(p => `${p[0]},${p[1]}`).join(' ');
        const areaPath = `M ${d.points.map(p => `${p[0]},${p[1]}`).join(' L ')} L 600,110 L 0,110 Z`;
        const lp = d.points[d.points.length - 1];
        c.innerHTML = `<svg viewBox="0 0 600 120" width="100%" height="110" preserveAspectRatio="none">
          <defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="${d.color}" stop-opacity="0.4"/><stop offset="100%" stop-color="${d.color}" stop-opacity="0"/></linearGradient></defs>
          <g stroke="rgba(255,255,255,0.06)" stroke-width="1"><line x1="0" y1="20" x2="600" y2="20"/><line x1="0" y1="55" x2="600" y2="55"/><line x1="0" y1="90" x2="600" y2="90"/></g>
          <line x1="0" y1="78" x2="600" y2="78" stroke="#fbbf24" stroke-width="1" stroke-dasharray="3,3"/>
          <text x="6" y="76" font-size="9" fill="#fbbf24">警報閾値 80ppm</text>
          <path d="${areaPath}" fill="url(#cg)" opacity="0.7"/>
          <polyline fill="none" stroke="${d.color}" stroke-width="2.5" points="${pts}"/>
          <circle cx="${lp[0]}" cy="${lp[1]}" r="4" fill="${d.color}"/>
          <text x="${lp[0]-60}" y="${lp[1]-5}" font-size="10" fill="${d.color}" font-weight="700">${d.popText}</text>
          <g font-size="9" fill="#94a3b8"><text x="0" y="116">3日前</text><text x="290" y="116">36h前</text><text x="560" y="116">現在</text></g>
        </svg>`;
    }

    _renderRiskChart() {
        const el = this.refs.riskChart;
        if (!el || el.dataset.rendered) return;
        el.dataset.rendered = '1';
        el.innerHTML = `<svg viewBox="0 0 300 100" width="100%" height="100">
          <g stroke="#ecebea" stroke-width="1"><line x1="30" y1="20" x2="290" y2="20"/><line x1="30" y1="50" x2="290" y2="50"/><line x1="30" y1="80" x2="290" y2="80"/></g>
          <text x="2" y="24" font-size="9" fill="#444">100%</text><text x="2" y="54" font-size="9" fill="#444">50%</text><text x="2" y="84" font-size="9" fill="#444">0%</text>
          <polyline fill="none" stroke="#ba0517" stroke-width="2.5" points="30,75 70,68 110,55 150,38 190,22 230,12 270,8"/>
          <circle cx="30" cy="75" r="3" fill="#04844b"/><text x="36" y="74" font-size="9" fill="#04844b" font-weight="700">今</text>
          <circle cx="270" cy="8" r="3" fill="#ba0517"/><text x="220" y="6" font-size="9" fill="#ba0517" font-weight="700">72hで87%</text>
          <line x1="30" y1="80" x2="290" y2="80" stroke="#444"/>
          <g font-size="8" fill="#696969"><text x="30" y="95">0h</text><text x="150" y="95">36h</text><text x="270" y="95">72h</text></g>
        </svg>`;
    }

    // AF
    toggleAgentforce() {
        this.afPanelOpen = !this.afPanelOpen;
        if (this.afPanelOpen && !this.afLaunched) this.launchAgentforce();
    }
    launchAgentforce() {
        if (this.afLaunched) return;
        this.afLaunched = true;
        this.afPanelOpen = true;
        this._streamAf();
        setTimeout(() => {
            this.showPreAfCard = false;
            this.showActionPlan = true;
            this.showInsightCard = true;
            this.afConfidence = '信頼度 94% ・ 3.4秒';
            this._revealSteps();
            this._helper('💡 Agentforce が 5システムを束ねて対応プランを作成しました。「承認して実行」をクリック');
        }, 3700);
    }
    _revealSteps() {
        this.actionSteps.forEach((s, i) => {
            setTimeout(() => {
                const steps = JSON.parse(JSON.stringify(this.actionSteps));
                steps[i].stepClass = 'action-step is-revealed';
                this.actionSteps = steps;
            }, i * 250);
        });
    }
    _streamAf() {
        const msgs = [
            { delay:200, text:'新豊洲1号トランスのアラートを検知しました。横断分析を開始します...' },
            { delay:1200, text:'<strong>SAP 確認完了</strong> 予備品 (P/N: TR-CF-300-IK) は千葉資材センターに1セット。緊急便で本日22:00着可能です。' },
            { delay:2300, text:'<strong>AWS 系統シミュレータ</strong> 本機停止時、富津火力 +30万kW で都心ループへの供給維持可能。' },
            { delay:3300, text:'<strong>M365 + Teams 連携</strong> 保全2班 5名のスケジュールを明日 02:00–06:00 で仮押え。東芝 中村氏との Teams 緊急会議を 16:00 で発行しました。' },
            { delay:4300, text:'5システムの準備が完了しました。<br/>左の画面で<strong>「承認して実行」</strong>を押してください。' }
        ];
        msgs.forEach(m => {
            setTimeout(() => {
                const nm = { id: ++this.afMsgIdCounter, text: m.text };
                this.afMessages = [...this.afMessages, nm];
                setTimeout(() => this._renderAfMessages(), 50);
            }, m.delay);
        });
    }
    _renderAfMessages() {
        this.afMessages.forEach(msg => {
            const el = this.template.querySelector(`[data-msgid="${msg.id}"].af-bubble`);
            if (el && !el.dataset.rendered) { el.innerHTML = msg.text; el.dataset.rendered = '1'; }
        });
        const conv = this.refs.afConversation;
        if (conv) conv.scrollTop = conv.scrollHeight;
    }
    handleAfInput(event) {
        if (event.key !== 'Enter') return;
        const v = event.target.value.trim();
        if (!v) return;
        this.afMessages = [...this.afMessages, { id: ++this.afMsgIdCounter, text: `ご質問「${v}」を受付ました。現在の優先事項は新豊洲変電所の緊急対応です。` }];
        event.target.value = '';
        setTimeout(() => this._renderAfMessages(), 50);
    }

    // EXECUTE
    executePlan() {
        this.executeDisabled = true;
        const titles = ['SAP 発注確定', 'AWS 系統迂回シミュレーション完了', '気象/施工ウィンドウ確定', 'M365 班員スケジュール確定', 'Teams 会議発行完了'];
        this.actionSteps.forEach((s, i) => {
            setTimeout(() => {
                const steps = JSON.parse(JSON.stringify(this.actionSteps));
                steps[i].stepClass = 'action-step is-revealed is-done';
                steps[i].numClass = 'action-step-num done';
                steps[i].pillText = '完了';
                steps[i].pillClass = 'action-step-pill pill-green';
                this.actionSteps = steps;
                this._toast('success', titles[i], '', 3000);
                if (i === this.actionSteps.length - 1) {
                    setTimeout(() => {
                        this._toast('success', '✓ 5システムの確定指示を完了', 'Slack 対策室チャンネルが自動起動しました', 4000);
                        this._helper('💡 「Slack 対策室を見る」をクリックしてください');
                        this.executeAllDone = true;
                    }, 500);
                }
            }, (i + 1) * 600);
        });
    }

    // SCENE NAV
    goToScene2() { this.currentScene = 2; window.scrollTo(0,0); }
    backToScene1() { this.currentScene = 1; window.scrollTo(0,0); }
    goToScene3() { this.currentScene = 3; this.showMobileSlack = true; this.showMobileTableau2 = false; this.showMobileResult = false; window.scrollTo(0,0); this._helper('💡 「📊 詳細データを確認」をタップ'); }
    backToScene2() { this.currentScene = 2; window.scrollTo(0,0); }

    // SLACK
    advanceSlack() {
        const msg = SLACK_MESSAGES.find(m => m.id === this.slackProgress);
        if (!msg) return;
        this.visibleSlackMsgs = [...this.visibleSlackMsgs, msg];
        setTimeout(() => this._renderSlackMessages(), 50);
        if (this.slackProgress === 8) {
            this.sekiStatusText = '通知中'; this.sekiStatusClass = 'pill pill-red';
            this.showEscalateBtn = true;
            this._helper('💡 関 常務のスマホに通知が届きました。「📱 関 常務のスマホ画面を見る」をクリック');
        } else {
            const labels = { 2:'▶ 渡辺氏のコスト確認', 3:'▶ Agentforce のコスト試算', 4:'▶ 松本氏が ROI比較を依頼', 5:'▶ Tableau Next が ROI を生成', 6:'▶ 関常務へエスカレーション指示', 7:'▶ 関 常務のモバイルへ送信' };
            this.slackNextLabel = labels[this.slackProgress] || '▶ 次へ';
        }
        this.slackProgress++;
        setTimeout(() => { const el = this.refs.slackMsgs; if (el) el.scrollTop = el.scrollHeight; }, 100);
    }
    _renderSlackMessages() {
        this.visibleSlackMsgs.forEach(msg => {
            const el = this.template.querySelector(`[data-msgid="${msg.id}"].slack-msg-content`);
            if (el && !el.dataset.rendered) { el.innerHTML = msg.html; el.dataset.rendered = '1'; }
        });
    }

    // MOBILE
    showMobileTableauFn() { this.showMobileSlack = false; this.showMobileTableau2 = true; this._helper('💡 「▶ 再生」「▶ 表示」で詳細確認→承認ボタンをタップ'); }
    backToMobileSlack() { this.showMobileTableau2 = false; this.showMobileSlack = true; }
    animateBars() { this.blackoutBarWidth = 100; this.emergencyBarWidth = 6; }
    animateHeatmap() { this.heatmapActive = true; }
    vipApprove() {
        this._toast('success', '✓ 承認受信', 'SAP 稟議「承認済」に更新されました', 5000);
        setTimeout(() => { this.showMobileTableau2 = false; this.showMobileResult = true; this._revealDsTiles(); }, 600);
    }
    _revealDsTiles() {
        this._dsTilesData.forEach((t, i) => {
            setTimeout(() => { this._dsTilesData[i].shown = true; this._dsTilesData = [...this._dsTilesData]; this._toast('success', t.title, '', 3000); }, (i+1)*500);
        });
    }

    // MODAL
    openStepModal(event) {
        const sid = parseInt(event.currentTarget.dataset.stepid, 10);
        const d = STEP_DETAILS[sid]; if (!d) return;
        this.modalTitle = d.title; this.modalSub = d.sub; this._pendingModalContent = d.html;
        this.showStepModal = true;
    }
    closeStepModal() { this.showStepModal = false; this._pendingModalContent = null; }
    stopProp(event) { event.stopPropagation(); }
    _renderModalContent() {
        if (!this.showStepModal || !this._pendingModalContent) return;
        const el = this.refs.modalBody;
        if (el && !el.dataset.rendered) { el.innerHTML = this._pendingModalContent; el.dataset.rendered = '1'; }
    }

    // RESET
    resetDemo() {
        this.currentScene = 1; this.afLaunched = false; this.showPreAfCard = true;
        this.showActionPlan = false; this.showInsightCard = false; this.afPanelOpen = false;
        this.afMessages = []; this.afMsgIdCounter = 0; this.executeDisabled = false; this.executeAllDone = false;
        this._initActionSteps(); this.slackProgress = 2; this.visibleSlackMsgs = [];
        this.slackNextLabel = '▶ 富津火力 焚き増しプランを表示'; this.showEscalateBtn = false;
        this.sekiStatusText = '待機'; this.sekiStatusClass = 'pill pill-orange';
        this.showMobileSlack = true; this.showMobileTableau2 = false; this.showMobileResult = false;
        this.blackoutBarWidth = 0; this.emergencyBarWidth = 0; this.heatmapActive = false;
        this._dsTilesData = JSON.parse(JSON.stringify(DS_TILES_DEF));
        window.scrollTo(0,0);
        this._toast('danger', '⚠ AWS IoT が異常検知', '新豊洲変電所 1号トランス・絶縁油中ガス', 5000);
        this._helper('💡 デモを最初から再生します');
    }

    // KEYBOARD
    _onKey(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
        if (event.key === 'Escape') { this.closeStepModal(); this.closePathDetail(); return; }
        if (event.key === 'ArrowRight') { event.preventDefault(); this._next(); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); this._prev(); }
    }
    _next() {
        if (this.currentScene === 1) {
            if (!this.afLaunched) { this.launchAgentforce(); return; }
            const rev = this.actionSteps.filter(s => s.stepClass.includes('is-revealed')).length;
            if (rev < this.actionSteps.length) { const s = JSON.parse(JSON.stringify(this.actionSteps)); s[rev].stepClass = 'action-step is-revealed'; this.actionSteps = s; return; }
            const done = this.actionSteps.filter(s => s.stepClass.includes('is-done')).length;
            if (done === 0) { this.executePlan(); return; }
            if (done === this.actionSteps.length && this.executeAllDone) this.goToScene2();
            return;
        }
        if (this.currentScene === 2) { if (this.slackProgress <= 8) { this.advanceSlack(); } else if (this.showEscalateBtn) { this.goToScene3(); } return; }
        if (this.currentScene === 3) {
            if (this.showMobileSlack) { this.showMobileTableauFn(); return; }
            if (this.showMobileTableau2) {
                if (this.blackoutBarWidth === 0) { this.animateBars(); return; }
                if (!this.heatmapActive) { this.animateHeatmap(); return; }
                this.vipApprove(); return;
            }
            if (this.showMobileResult) {
                const next = this._dsTilesData.find(t => !t.shown);
                if (next) { const idx = this._dsTilesData.findIndex(t => t.id === next.id); this._dsTilesData[idx].shown = true; this._dsTilesData = [...this._dsTilesData]; this._toast('success', next.title, '', 3000); } else { this.resetDemo(); }
            }
        }
    }
    _prev() {
        if (this.currentScene === 3) { this.backToScene2(); return; }
        if (this.currentScene === 2) { this.backToScene1(); return; }
    }

    // HELPERS
    _toast(type, title, desc, dur = 4000) {
        const stack = this.template.querySelector('.toast-stack');
        if (!stack) return;
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerHTML = `<div class="toast-title">${title}</div>${desc ? `<div class="toast-desc">${desc}</div>` : ''}`;
        stack.appendChild(t);
        setTimeout(() => { t.classList.add('dismiss'); setTimeout(() => t.remove(), 300); }, dur);
    }
    _helper(text) {
        this.demoHelperClass = 'demo-helper show';
        const el = this.refs.demoHelperText;
        if (el) el.innerHTML = text;
        clearTimeout(this._ht);
        this._ht = setTimeout(() => { this.demoHelperClass = 'demo-helper'; }, 5000);
    }
}
