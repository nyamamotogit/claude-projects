import { LightningElement, api, wire, track } from 'lwc';
import getMessages from '@salesforce/apex/AlertController.getMessages';

export default class SwarmTimeline extends LightningElement {
    @api recordId;
    @track messages = [];
    revealedCount = 2;

    @wire(getMessages, { alertId: '$recordId' })
    wiredMessages({ data, error }) {
        if (data) {
            this.messages = data.map(m => this.decorate(m));
            this.applyReveal();
        }
    }

    decorate(m) {
        const type = m.Sender_Type__c;
        const initials = type === 'Agentforce' ? 'AF' : type === 'Tableau' ? 'TB' : (m.Sender_Name__c ? m.Sender_Name__c.substring(0, 1) : '?');
        const avatarBg =
            type === 'Agentforce' ? '0070d2' :
            type === 'Tableau' ? '1f447e' : '2eb67d';
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${avatarBg}&color=fff&size=72`;
        let timeLabel = '';
        if (m.Sent_At__c) {
            const d = new Date(m.Sent_At__c);
            timeLabel = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        }
        return {
            ...m,
            avatarUrl,
            timeLabel,
            isApp: type === 'Agentforce' || type === 'Tableau',
            hasAttachment: !!m.Attachment_Title__c,
            shown: false,
            rowClass: 'msg'
        };
    }

    applyReveal() {
        this.messages = this.messages.map((m, i) => ({
            ...m,
            shown: i < this.revealedCount,
            rowClass: 'msg ' + (i < this.revealedCount ? 'is-show' : 'is-hidden')
        }));
    }

    advance() {
        if (this.revealedCount >= this.messages.length) return;
        this.revealedCount++;
        this.applyReveal();
    }
    rewind() {
        if (this.revealedCount <= 2) return;
        this.revealedCount--;
        this.applyReveal();
    }
    revealAll() { this.revealedCount = this.messages.length; this.applyReveal(); }
    resetReveal() { this.revealedCount = 2; this.applyReveal(); }

    get progressLabel() { return `${this.revealedCount} / ${this.messages.length} メッセージ`; }
    get hasMoreDisabled() { return this.revealedCount >= this.messages.length; }
    get canRewindDisabled() { return this.revealedCount <= 2; }
}
