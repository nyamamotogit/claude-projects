import { LightningElement, track } from 'lwc';

const APPROVALS = [
    { id:1, apNum:'RNG-2026-0615-EM01', title:'新豊洲変電所 1号主変圧器 緊急保全費用', dept:'設備部 東京NWセンター', requester:'佐々木 雅也', approver:'関 常務 (取締役)', amount:'¥5.2億', date:'2026/06/15 13:45', approvalDate:'2026/06/15 13:50', status:'承認済', isAgentGenerated:true, agentNote:'IoT検知→分析→稟議生成まで8分',
      urgencyNote:'⚡ 放置で24万世帯停電リスク / 損失回避ROI 16〜23倍',
      badgeCls:'ap-badge approved-badge',
      description:'AWS IoT Core DGA-MON-1F-Aセンサーが新豊洲変電所1号主変圧器において油中ガス異常(水素218ppm・アセチレン検出)を検知。内部局所放電の可能性が高く、放置した場合72時間以内に中央区・港区・江東区の約24万世帯への電力供給が危機に瀕する。Agentforceが系統影響シミュレーション・部品調達・人員確保・メーカー召集を自動調整済み。関常務の承認により即座に作業開始可能。',
      costItems:[{id:'c1',item:'予備部品 (TR-CF-300-IK)',amount:'¥1,840万',note:'絶縁紙キット・冷却ファンモーター'},{id:'c2',item:'緊急輸送費',amount:'¥32万',note:'千葉→新豊洲 緊急便'},{id:'c3',item:'保全作業費',amount:'¥480万',note:'深夜作業・技術者5名 8h'},{id:'c4',item:'東芝技術者立会費',amount:'¥220万',note:'緊急技術支援契約'},{id:'c5',item:'富津火力 燃料増分',amount:'¥4,200万',note:'LNG 追加320トン 4時間分'},{id:'c6',item:'系統切替 作業費',amount:'¥180万',note:'中央給電指令所 追加対応'},{id:'c7',item:'予備費 (10%)',amount:'¥295万',note:''}],
      flowSteps:[{id:'f1',icon:'✓',role:'申請者',name:'佐々木 雅也 (設備部)',date:'2026/06/15 13:45',cls:'flow-step done'},{id:'f2',icon:'✓',role:'設備部長 承認',name:'渡辺 建設部長',date:'2026/06/15 13:47',cls:'flow-step done'},{id:'f3',icon:'✓',role:'経営企画 確認',name:'松本 真理 (経営企画)',date:'2026/06/15 13:49',cls:'flow-step done'},{id:'f4',icon:'✓',role:'取締役 承認',name:'関 常務 (最終承認)',date:'2026/06/15 13:50',cls:'flow-step done'}]},
    { id:2, apNum:'RNG-2026-0615-EM02', title:'東京変電所 2号変圧器 過負荷対応 緊急保全費用', dept:'設備部 東京NWセンター', requester:'山田 隆 (保全第1班長)', approver:'−', amount:'¥1.8億', date:'2026/06/15 18:30', approvalDate:'−', status:'承認待ち', isAgentGenerated:false,
      urgencyNote:'⚠ 油温上昇継続中 / 早期決裁を推奨',
      badgeCls:'ap-badge pending-badge',
      description:'東京変電所2号変圧器において油温異常上昇と負荷率87%超過が続いている。冷却系補強と部品交換が必要。一次対処として負荷分散を実施中だが、根本対応のための費用承認が必要。',
      costItems:[{id:'c1',item:'冷却系補強工事',amount:'¥800万',note:'冷却ファン増設・配管改修'},{id:'c2',item:'保全作業費',amount:'¥380万',note:'緊急保全 4名 12h'},{id:'c3',item:'部品費',amount:'¥420万',note:'冷却系部品一式'},{id:'c4',item:'試験・検査費',amount:'¥200万',note:'保全後機能確認試験'}],
      flowSteps:[{id:'f1',icon:'✓',role:'申請者',name:'山田 隆 (設備部)',date:'2026/06/15 18:30',cls:'flow-step done'},{id:'f2',icon:'⏳',role:'設備部長 承認',name:'渡辺 建設部長',date:'審査中',cls:'flow-step active'},{id:'f3',icon:'○',role:'経営企画 確認',name:'−',date:'−',cls:'flow-step pending'},{id:'f4',icon:'○',role:'取締役 承認',name:'−',date:'−',cls:'flow-step pending'}]},
    { id:3, apNum:'RNG-2026-0612-RO01', title:'品川変電所 定期点検 費用', dept:'設備部 東京NWセンター', requester:'林 達也', approver:'鈴木 副部長', amount:'¥280万', date:'2026/06/10', approvalDate:'2026/06/11 09:20', status:'承認済', isAgentGenerated:false, urgencyNote:'',
      badgeCls:'ap-badge approved-badge',
      description:'品川変電所 SF6ガス遮断器年次定期点検の費用承認。',
      costItems:[{id:'c1',item:'点検作業費',amount:'¥180万',note:'2名 8h'},{id:'c2',item:'測定機器レンタル',amount:'¥60万',note:'絶縁測定器'},{id:'c3',item:'消耗品',amount:'¥40万',note:'清掃用品・記録紙等'}],
      flowSteps:[{id:'f1',icon:'✓',role:'申請者',name:'林 達也 (設備部)',date:'2026/06/10',cls:'flow-step done'},{id:'f2',icon:'✓',role:'設備部長 承認',name:'鈴木 副部長',date:'2026/06/11 09:20',cls:'flow-step done'}]},
    { id:4, apNum:'RNG-2026-0605-PL01', title:'渋谷変電所 絶縁測定 年次点検費用', dept:'設備部 東京NWセンター', requester:'田中 慎一', approver:'渡辺 建設部長', amount:'¥320万', date:'2026/06/05', approvalDate:'2026/06/06 14:05', status:'承認済', isAgentGenerated:false, urgencyNote:'',
      badgeCls:'ap-badge approved-badge',
      description:'渋谷変電所主母線年次絶縁測定・清掃の費用。',
      costItems:[{id:'c1',item:'点検作業費',amount:'¥240万',note:'3名 4h 深夜割増'},{id:'c2',item:'機器費',amount:'¥80万',note:'接地工具・測定器'}],
      flowSteps:[{id:'f1',icon:'✓',role:'申請者',name:'田中 慎一',date:'2026/06/05',cls:'flow-step done'},{id:'f2',icon:'✓',role:'承認',name:'渡辺 建設部長',date:'2026/06/06',cls:'flow-step done'}]}
];

export default class TepcoApproval extends LightningElement {
    @track selectedAPId = null;

    get pendingApprovals() { return APPROVALS.filter(a => a.status === '承認待ち'); }
    get approvedApprovals() { return APPROVALS.filter(a => a.status === '承認済'); }
    get selectedAP() { return this.selectedAPId ? APPROVALS.find(a => a.id === this.selectedAPId) || null : null; }

    selectAP(event) { this.selectedAPId = parseInt(event.currentTarget.dataset.apid, 10); }
    closeAPDetail() { this.selectedAPId = null; }
    stopProp(event) { event.stopPropagation(); }
}
