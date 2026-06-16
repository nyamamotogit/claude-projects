import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

const FIELDS = [
    'Substation_Alert__c.H2_PPM__c',
    'Substation_Alert__c.C2H2_PPM__c',
    'Substation_Alert__c.Oil_Temp__c',
    'Substation_Alert__c.Load_Rate__c'
];

const SERIES = {
    h2:   { name: '水素 H₂ 濃度推移 (過去72時間)', unit: 'ppm', threshold: 80, points: '0,90 60,89 120,90 180,88 240,89 300,87 360,86 420,82 480,68 520,42 560,22 600,15', popY: 15, color: '#22d3ee' },
    c2h2: { name: 'アセチレン C₂H₂ 推移',         unit: 'ppm', threshold: 5,  points: '0,100 60,100 120,100 180,100 240,100 300,100 360,100 420,98 480,80 520,55 560,32 600,20', popY: 20, color: '#ff6b6b' },
    temp: { name: '油温 推移',                    unit: '℃',  threshold: 70, points: '0,72 60,70 120,71 180,69 240,68 300,66 360,63 420,58 480,52 520,46 560,42 600,38', popY: 38, color: '#fbbf24' },
    load: { name: '負荷率 推移',                  unit: '%',  threshold: 80, points: '0,55 60,58 120,52 180,60 240,50 300,55 360,53 420,52 480,54 520,53 560,55 600,52', popY: 52, color: '#94a3b8' }
};

export default class IotLivePanel extends LightningElement {
    @api recordId;
    selected = 'h2';

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    record;

    get h2() { return getFieldValue(this.record.data, 'Substation_Alert__c.H2_PPM__c') ?? 0; }
    get c2h2() { return getFieldValue(this.record.data, 'Substation_Alert__c.C2H2_PPM__c') ?? 0; }
    get temp() { return getFieldValue(this.record.data, 'Substation_Alert__c.Oil_Temp__c') ?? 0; }
    get load() { return getFieldValue(this.record.data, 'Substation_Alert__c.Load_Rate__c') ?? 0; }

    get selectedSeries() { return SERIES[this.selected]; }
    get chartName() { return this.selectedSeries.name; }
    get chartPoints() { return this.selectedSeries.points; }
    get chartColor() { return this.selectedSeries.color; }
    get popY() { return this.selectedSeries.popY; }
    get popText() {
        const v = this[this.selected];
        return `${v} ${this.selectedSeries.unit}`;
    }
    get areaPath() {
        const pts = this.selectedSeries.points.split(' ');
        return 'M ' + pts.join(' L ') + ' L 600,100 L 0,100 Z';
    }
    get popTextX() { return 540; }

    selectMetric(event) {
        this.selected = event.currentTarget.dataset.metric;
    }

    isSelected(m) { return this.selected === m ? 'iot-stat is-selected' : 'iot-stat'; }
    get h2Class() { return this.selected === 'h2' ? 'iot-stat alert is-selected' : 'iot-stat alert'; }
    get c2h2Class() { return this.selected === 'c2h2' ? 'iot-stat alert is-selected' : 'iot-stat alert'; }
    get tempClass() { return this.selected === 'temp' ? 'iot-stat is-selected' : 'iot-stat'; }
    get loadClass() { return this.selected === 'load' ? 'iot-stat is-selected' : 'iot-stat'; }
}
