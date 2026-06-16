import { LightningElement, track } from 'lwc';

const WORK_ORDERS = [
    { id:1, woNum:'WO-2026-0615-EM01', title:'新豊洲変電所 1号主変圧器 緊急保全 (絶縁紙・冷却ファン交換)', priority:'🔴 緊急', priorityCls:'wo-priority urgent', location:'新豊洲変電所 地下1F', scheduledDate:'2026/06/16 02:00-06:00', duration:'4時間', assignee:'保全第2班 大山 剛 (5名)', status:'⏳ 準備中', statusCls:'wo-status preparing', equipment:'1号主変圧器 / 300MVA', progress:15, agentNote:'IoT異常検知→AI診断→承認取得まで6分で完了', isUrgent:true,
      description:'油中ガス分析で水素218ppm・アセチレン検出。内部局所放電の疑い。Agentforceが系統迂回計画(富津火力+30万kW)・部品調達・人員確保・東芝技術召集を自動調整。関常務承認済み (13:50)。',
      steps:[{id:'s1',num:'1',text:'富津火力 #2号機 +30万kW 焚き増し / 系統切替指示',by:'渡辺 健 (中給)',cls:'step done'},{id:'s2',num:'2',text:'新京葉線 154kV 迂回完了確認',by:'渡辺 健 (中給)',cls:'step done'},{id:'s3',num:'3',text:'1号機解列・作業用接地取り付け',by:'大山 剛',cls:'step active'},{id:'s4',num:'4',text:'絶縁紙キット交換 (P/N: TR-CF-300-IK)',by:'田中 慎一',cls:'step pending'},{id:'s5',num:'5',text:'冷却ファンモーター交換・試運転',by:'林 達也',cls:'step pending'},{id:'s6',num:'6',text:'油中ガス再採取・試験 (H₂<80ppm確認)',by:'佐藤 直樹',cls:'step pending'},{id:'s7',num:'7',text:'復電・系統正常化確認',by:'川村 玲奈',cls:'step pending'}],
      materials:[{id:'m1',pn:'TR-CF-300-IK',name:'絶縁紙キット + 冷却ファンモーター',qty:'1式',src:'千葉資材センター'},{id:'m2',pn:'OIL-T-46S',name:'変圧器絶縁油 Type-46S',qty:'200L',src:'横浜EC倉庫'}]},
    { id:2, woNum:'WO-2026-0615-EM02', title:'東京変電所 2号変圧器 過負荷対応・保全作業', priority:'🔴 緊急', priorityCls:'wo-priority urgent', location:'東京変電所 1F', scheduledDate:'2026/06/10 18:00 ~', duration:'進行中 (6h経過)', assignee:'保全第1班 山田 隆 (3名)', status:'🔧 作業中', statusCls:'wo-status in-progress', equipment:'2号変圧器 / 200MVA', progress:65, isUrgent:false,
      description:'油温異常上昇と負荷率87%超過に対応中。負荷分散と冷却系の点検・調整を実施。',
      steps:[{id:'s1',num:'1',text:'負荷分散 (都心ループ側へ一部転送)',by:'山田 隆',cls:'step done'},{id:'s2',num:'2',text:'冷却ファン追加起動・動作確認',by:'鈴木 哲也',cls:'step done'},{id:'s3',num:'3',text:'油温低下確認 (目標: 65℃以下)',by:'山田 隆',cls:'step active'},{id:'s4',num:'4',text:'絶縁油採取・DGA分析',by:'佐藤 直樹',cls:'step pending'},{id:'s5',num:'5',text:'定常運転復帰確認',by:'山田 隆',cls:'step pending'}],
      materials:null},
    { id:3, woNum:'WO-2026-0612-RO01', title:'品川変電所 定期点検 (SF6ガス機器・遮断器)', priority:'🟡 通常', priorityCls:'wo-priority normal', location:'品川変電所 1F 開閉所', scheduledDate:'2026/06/12 09:00-17:00', duration:'8時間', assignee:'保全第3班 林 達也 (2名)', status:'✓ 完了', statusCls:'wo-status done', equipment:'CB-3A / 154kV 遮断器', progress:100, isUrgent:false,
      description:'SF6ガス遮断器の年次定期点検。ガス圧測定・動作試験・絶縁測定を実施。',
      steps:[{id:'s1',num:'1',text:'SF6ガス圧測定 (0.62MPa 正常)',by:'林 達也',cls:'step done'},{id:'s2',num:'2',text:'動作試験 (投入・開放各5回)',by:'川村 玲奈',cls:'step done'},{id:'s3',num:'3',text:'外観清掃・接点確認',by:'林 達也',cls:'step done'},{id:'s4',num:'4',text:'絶縁測定 (合格)',by:'川村 玲奈',cls:'step done'}],
      materials:null},
    { id:4, woNum:'WO-2026-0620-PL01', title:'渋谷変電所 母線 絶縁測定・清掃 (年次)', priority:'🔵 計画', priorityCls:'wo-priority planned', location:'渋谷変電所 1F 変電室', scheduledDate:'2026/06/20 02:00-06:00', duration:'4時間', assignee:'保全第1班 田中 慎一 (3名)', status:'📅 計画中', statusCls:'wo-status planned', equipment:'主母線 66kV', progress:0, isUrgent:false,
      description:'年次定期点検。停電を伴う絶縁測定と清掃を実施予定。M365でスケジュール確保済み。',
      steps:[{id:'s1',num:'1',text:'停電・作業用接地取り付け',by:'田中 慎一',cls:'step pending'},{id:'s2',num:'2',text:'外観清掃・変色・異物確認',by:'田中 慎一',cls:'step pending'},{id:'s3',num:'3',text:'絶縁抵抗測定 (各相)',by:'佐藤 直樹',cls:'step pending'},{id:'s4',num:'4',text:'復電・確認',by:'田中 慎一',cls:'step pending'}],
      materials:null},
    { id:5, woNum:'WO-2026-0625-PL02', title:'大崎変電所 リアクトル 絶縁油採取・分析', priority:'🔵 計画', priorityCls:'wo-priority planned', location:'大崎変電所 1F', scheduledDate:'2026/06/25 10:00-14:00', duration:'4時間', assignee:'保全第2班 佐藤 直樹 (2名)', status:'📅 計画中', statusCls:'wo-status planned', equipment:'リアクトル 154kV 50Mvar', progress:0, isUrgent:false,
      description:'定期DGA分析(年2回)のための絶縁油採取。',
      steps:[{id:'s1',num:'1',text:'安全確認・作業エリア設定',by:'佐藤 直樹',cls:'step pending'},{id:'s2',num:'2',text:'絶縁油採取 (各サンプリングポイント)',by:'佐藤 直樹',cls:'step pending'},{id:'s3',num:'3',text:'外観点検・記録',by:'大山 剛',cls:'step pending'}],
      materials:null}
];

export default class TepcoWorkOrder extends LightningElement {
    @track activeTab = 'active';
    @track selectedWOId = null;

    get tab1Cls() { return `tab-item${this.activeTab === 'active' ? ' active' : ''}`; }
    get tab2Cls() { return `tab-item${this.activeTab === 'planned' ? ' active' : ''}`; }
    get tab3Cls() { return `tab-item${this.activeTab === 'done' ? ' active' : ''}`; }

    get visibleWorkOrders() {
        const filtered = this.activeTab === 'active' ? WORK_ORDERS.filter(w => ['準備中','作業中'].some(s => w.status.includes(s)) || w.priorityCls.includes('urgent'))
            : this.activeTab === 'planned' ? WORK_ORDERS.filter(w => w.status.includes('計画'))
            : WORK_ORDERS.filter(w => w.status.includes('完了'));
        return filtered.map(w => ({ ...w, progressStyle: `width:${w.progress}%;background:${w.progress === 100 ? '#04844b' : w.priority.includes('緊急') ? '#ea001e' : '#1589ee'}` }));
    }

    get selectedWO() {
        if (!this.selectedWOId) return null;
        const wo = WORK_ORDERS.find(w => w.id === this.selectedWOId);
        if (!wo) return null;
        return { ...wo, progressStyle: `width:${wo.progress}%` };
    }

    setTab1() { this.activeTab = 'active'; }
    setTab2() { this.activeTab = 'planned'; }
    setTab3() { this.activeTab = 'done'; }

    selectWO(event) { this.selectedWOId = parseInt(event.currentTarget.dataset.woid, 10); }
    closeWODetail() { this.selectedWOId = null; }
    stopProp(event) { event.stopPropagation(); }
}
