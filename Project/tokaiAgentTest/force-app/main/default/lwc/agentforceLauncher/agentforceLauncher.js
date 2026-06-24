import { LightningElement, track, api } from 'lwc';
import { open } from 'lightning/accApi';

const BOT_ID = '0XxId000000PNAVKA4';

export default class AgentforceLauncher extends LightningElement {
    @api titleText = 'Agentforce がお手伝いします';
    @api placeholderText = 'Agentforce に質問する...';
    @api showSuggestions = false;
    @api suggestionList = '休暇申請の方法は？,経費精算のやり方,社内規程を教えて';

    @track inputText = '';

    get suggestions() {
        return this.suggestionList ? this.suggestionList.split(',').map(s => s.trim()) : [];
    }

    get sendButtonClass() {
        return 'send-button send-button-active';
    }

    handleInput(event) {
        this.inputText = event.target.value;
    }

    handleKeydown(event) {
        if (event.key === 'Enter') {
            this.launchAgent();
        }
    }

    handleSuggestion(event) {
        this.inputText = event.currentTarget.dataset.text;
        this.launchAgent();
    }

    async launchAgent() {
        const message = this.inputText.trim();

        this.inputText = '';
        const input = this.template.querySelector('.agent-input');
        if (input) input.value = '';

        // 標準 Agentforce パネルを開く
        await open(BOT_ID);
    }
}
