import { LightningElement, api, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getSteps from '@salesforce/apex/AlertController.getSteps';
import runAgentforce from '@salesforce/apex/AlertController.runAgentforce';
import executeStep from '@salesforce/apex/AlertController.executeStep';
import approvePlan from '@salesforce/apex/AlertController.approvePlan';
import resetDemo from '@salesforce/apex/AlertController.resetDemo';

const RECORD_FIELDS = [
    'Substation_Alert__c.Status__c',
    'Substation_Alert__c.AF_Confidence__c',
    'Substation_Alert__c.AF_Reasoning__c'
];

const SYSTEM_COLORS = {
    SAP: '#0073e6', AWS: '#ff9900', M365: '#d83b01',
    Teams: '#6264a7', DC: '#032d60', Slack: '#4a154b'
};
const SYSTEM_LABELS = {
    SAP: 'SAP', AWS: 'AWS', M365: 'M365',
    Teams: 'Teams', DC: '中央給電指令所', Slack: 'Slack'
};

export default class AgentforcePlan extends LightningElement {
    @api recordId;
    @track steps = [];
    wiredStepsResult;
    busy = false;

    @wire(getRecord, { recordId: '$recordId', fields: RECORD_FIELDS })
    record;

    @wire(getSteps, { alertId: '$recordId' })
    wiredSteps(result) {
        this.wiredStepsResult = result;
        if (result.data) {
            this.steps = result.data.map(s => ({
                ...s,
                badgeStyle: `background:${SYSTEM_COLORS[s.System__c] || '#444'}`,
                systemLabel: SYSTEM_LABELS[s.System__c] || s.System__c,
                pillClass: this.pillClass(s.Status__c),
                rowClass: 'step-row ' + (s.Status__c === '完了' ? 'is-done' : (s.Status__c === '実行中' ? 'is-running' : ''))
            }));
        }
    }

    pillClass(status) {
        if (status === '完了') return 'pill green';
        if (status === '実行中') return 'pill orange';
        return 'pill gray';
    }

    get status() { return getFieldValue(this.record.data, 'Substation_Alert__c.Status__c'); }
    get reasoning() { return getFieldValue(this.record.data, 'Substation_Alert__c.AF_Reasoning__c'); }
    get confidence() { return getFieldValue(this.record.data, 'Substation_Alert__c.AF_Confidence__c'); }

    get notLaunched() { return this.status === 'IoT検知' || !this.status; }
    get launched()    { return !this.notLaunched; }
    get notApproved() { return this.status !== '承認済'; }
    get approved()    { return this.status === '承認済'; }
    get confidenceLabel() { return this.confidence ? `信頼度 ${this.confidence}%` : '分析中...'; }

    async handleLaunch() {
        this.busy = true;
        try {
            await runAgentforce({ alertId: this.recordId });
            this.toast('success', '✓ Agentforce 起動', 'SAP・AWS・M365・Teams から横断照合し、対応プランを生成しました');
            await refreshApex(this.wiredStepsResult);
        } catch (e) {
            this.toast('error', 'エラー', e?.body?.message || e.message);
        } finally { this.busy = false; }
    }

    async handleExecuteStep(event) {
        const stepId = event.currentTarget.dataset.id;
        const title = event.currentTarget.dataset.title;
        await executeStep({ stepId });
        this.toast('success', '✓ ' + title, 'システムに確定指示を送信しました');
        await refreshApex(this.wiredStepsResult);
    }

    async handleApprove() {
        this.busy = true;
        try {
            await approvePlan({ alertId: this.recordId });
            this.toast('success', '✓ 承認完了 ・ 5システムが同時に動きました', 'Slack 対策室にステータス通知を投稿しました');
            await refreshApex(this.wiredStepsResult);
        } catch (e) {
            this.toast('error', 'エラー', e?.body?.message || e.message);
        } finally { this.busy = false; }
    }

    async handleReset() {
        await resetDemo({ alertId: this.recordId });
        this.toast('info', 'デモをリセットしました', '');
        await refreshApex(this.wiredStepsResult);
    }

    toast(variant, title, message) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
