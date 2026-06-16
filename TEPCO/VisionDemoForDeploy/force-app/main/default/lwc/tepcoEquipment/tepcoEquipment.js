import { LightningElement, track } from 'lwc';

const EQUIPMENT = [
    { id:1, name:'新豊洲変電所 1号主変圧器', type:'変圧器', typeIcon:'🔋', location:'江東区豊洲 (地下)', voltage:'275/154kV', capacity:'300MVA', maker:'東芝エネルギーシステムズ', commDate:'2018年3月', lifespan:'40年', year:2018, group:'東京NWセンター 保全第2班', status:'⚠ Critical', lastMaint:'2026-05-10', statusCls:'status-badge critical', cardIconCls:'card-icon red', rowCls:'eq-row selected',
      sensors:[{id:'s1',label:'水素 H₂',value:'218 ppm',trend:'▲ +186%',cls:'sensor-item alert'},{id:'s2',label:'アセチレン C₂H₂',value:'12 ppm',trend:'▲ 通常未検出',cls:'sensor-item alert'},{id:'s3',label:'油温',value:'68.4℃',trend:'▲ +4.2℃',cls:'sensor-item warn'},{id:'s4',label:'負荷率',value:'62%',trend:'→ 平常',cls:'sensor-item ok'}],
      maintHistory:[{id:'m1',date:'2026-05-10',type:'定期',typeCls:'maint-badge planned',desc:'絶縁油採取・分析',by:'佐藤 直樹'},{id:'m2',date:'2025-11-22',type:'定期',typeCls:'maint-badge planned',desc:'外観点検・清掃',by:'田中 慎一'},{id:'m3',date:'2024-03-15',type:'緊急',typeCls:'maint-badge urgent',desc:'冷却ファン交換',by:'大山 剛'}]},
    { id:2, name:'新豊洲変電所 2号主変圧器', type:'変圧器', typeIcon:'🔋', location:'江東区豊洲 (地下)', voltage:'275/154kV', capacity:'300MVA', maker:'日立製作所', commDate:'2020年6月', lifespan:'40年', year:2020, group:'東京NWセンター 保全第2班', status:'✓ 正常', lastMaint:'2026-04-22', statusCls:'status-badge ok', cardIconCls:'card-icon green', rowCls:'eq-row',
      sensors:[{id:'s1',label:'水素 H₂',value:'24 ppm',trend:'→ 正常',cls:'sensor-item ok'},{id:'s2',label:'アセチレン C₂H₂',value:'0 ppm',trend:'→ 未検出',cls:'sensor-item ok'},{id:'s3',label:'油温',value:'62.1℃',trend:'→ 正常',cls:'sensor-item ok'},{id:'s4',label:'負荷率',value:'58%',trend:'→ 平常',cls:'sensor-item ok'}],
      maintHistory:[{id:'m1',date:'2026-04-22',type:'定期',typeCls:'maint-badge planned',desc:'絶縁油採取・分析',by:'佐藤 直樹'},{id:'m2',date:'2025-10-08',type:'定期',typeCls:'maint-badge planned',desc:'外観点検・清掃',by:'川村 玲奈'}]},
    { id:3, name:'東京変電所 2号変圧器', type:'変圧器', typeIcon:'🔋', location:'千代田区大手町', voltage:'275/66kV', capacity:'200MVA', maker:'三菱電機', commDate:'2015年9月', lifespan:'40年', year:2015, group:'東京NWセンター 保全第1班', status:'⚡ 保全中', lastMaint:'2026-06-10', statusCls:'status-badge warn', cardIconCls:'card-icon orange', rowCls:'eq-row',
      sensors:[{id:'s1',label:'水素 H₂',value:'48 ppm',trend:'▲ +22%',cls:'sensor-item warn'},{id:'s2',label:'油温',value:'71.2℃',trend:'▲ +6.8℃',cls:'sensor-item warn'},{id:'s3',label:'負荷率',value:'87%',trend:'▲ 高負荷',cls:'sensor-item warn'},{id:'s4',label:'アセチレン C₂H₂',value:'0 ppm',trend:'→ 正常',cls:'sensor-item ok'}],
      maintHistory:[{id:'m1',date:'2026-06-10',type:'緊急',typeCls:'maint-badge urgent',desc:'油温異常対応・過負荷確認',by:'大山 剛'},{id:'m2',date:'2026-02-14',type:'定期',typeCls:'maint-badge planned',desc:'絶縁油採取・分析',by:'田中 慎一'}]},
    { id:4, name:'品川変電所 遮断器 CB-3A', type:'遮断器', typeIcon:'⚙', location:'品川区北品川', voltage:'154kV', capacity:'40kA', maker:'ABB', commDate:'2020年4月', lifespan:'25年', year:2020, group:'東京NWセンター 保全第3班', status:'✓ 正常', lastMaint:'2026-05-30', statusCls:'status-badge ok', cardIconCls:'card-icon green', rowCls:'eq-row',
      sensors:[{id:'s1',label:'SF6ガス圧',value:'0.62MPa',trend:'→ 正常',cls:'sensor-item ok'},{id:'s2',label:'動作カウンタ',value:'1,842回',trend:'→ 正常',cls:'sensor-item ok'},{id:'s3',label:'油温',value:'N/A',trend:'→ -',cls:'sensor-item ok'},{id:'s4',label:'ガス漏洩',value:'検出なし',trend:'→ 正常',cls:'sensor-item ok'}],
      maintHistory:[{id:'m1',date:'2026-05-30',type:'定期',typeCls:'maint-badge planned',desc:'SF6ガス圧確認・外観点検',by:'林 達也'},{id:'m2',date:'2025-09-12',type:'定期',typeCls:'maint-badge planned',desc:'動作試験・絶縁測定',by:'川村 玲奈'}]},
    { id:5, name:'渋谷変電所 主母線', type:'母線', typeIcon:'〰', location:'渋谷区渋谷', voltage:'66kV', capacity:'-', maker:'古河電気工業', commDate:'2001年7月', lifespan:'50年', year:2001, group:'東京NWセンター 保全第1班', status:'✓ 正常', lastMaint:'2025-12-05', statusCls:'status-badge ok', cardIconCls:'card-icon green', rowCls:'eq-row',
      sensors:[{id:'s1',label:'電流',value:'1,240A',trend:'→ 正常',cls:'sensor-item ok'},{id:'s2',label:'電圧',value:'66.1kV',trend:'→ 正常',cls:'sensor-item ok'},{id:'s3',label:'温度',value:'45.2℃',trend:'→ 正常',cls:'sensor-item ok'},{id:'s4',label:'絶縁抵抗',value:'∞',trend:'→ 正常',cls:'sensor-item ok'}],
      maintHistory:[{id:'m1',date:'2025-12-05',type:'定期',typeCls:'maint-badge planned',desc:'絶縁測定・清掃',by:'田中 慎一'}]},
    { id:6, name:'大崎変電所 リアクトル', type:'リアクトル', typeIcon:'🔌', location:'品川区大崎', voltage:'154kV', capacity:'50Mvar', maker:'東芝エネルギーシステムズ', commDate:'2010年2月', lifespan:'40年', year:2010, group:'東京NWセンター 保全第2班', status:'✓ 正常', lastMaint:'2026-03-18', statusCls:'status-badge ok', cardIconCls:'card-icon green', rowCls:'eq-row',
      sensors:[{id:'s1',label:'油温',value:'55.0℃',trend:'→ 正常',cls:'sensor-item ok'},{id:'s2',label:'負荷率',value:'40%',trend:'→ 正常',cls:'sensor-item ok'}],
      maintHistory:[{id:'m1',date:'2026-03-18',type:'定期',typeCls:'maint-badge planned',desc:'外観点検・絶縁油採取',by:'佐藤 直樹'}]}
];

export default class TepcoEquipment extends LightningElement {
    @track viewMode = 'list';
    @track selectedEqId = 1;
    @track equipmentList = JSON.parse(JSON.stringify(EQUIPMENT));

    get isListView() { return this.viewMode === 'list'; }
    get isGridView() { return this.viewMode === 'grid'; }
    get listViewCls() { return `view-btn${this.viewMode === 'list' ? ' active' : ''}`; }
    get gridViewCls() { return `view-btn${this.viewMode === 'grid' ? ' active' : ''}`; }
    get selectedEquipment() { return this.equipmentList.find(e => e.id === this.selectedEqId) || null; }

    setListView() { this.viewMode = 'list'; }
    setGridView() { this.viewMode = 'grid'; }
    toggleFilter() {}
    showNewEquipModal() {}

    selectEquipment(event) {
        const eid = parseInt(event.currentTarget.dataset.eqid, 10);
        this.selectedEqId = eid;
        this.equipmentList = this.equipmentList.map(e => ({ ...e, rowCls: `eq-row${e.id === eid ? ' selected' : ''}` }));
    }
}
