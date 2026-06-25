import { LightningElement, api, track } from 'lwc';
import { open, execute } from 'lightning/accApi';

const BOT_ID = '0XxId000000PNAVKA4';

export default class AgentforceInputLauncherShort extends LightningElement {
    @api titleText = 'Agentforce がお手伝いします';
    @api placeholderText = 'Agentforce に質問する...';

    @track inputText = '';

    handleInput(event) {
        this.inputText = event.target.value;
    }

    handleKeydown(event) {
        if (event.key === 'Enter') {
            this.handleSubmit();
        }
    }

    async handleSubmit() {
        const message = this.inputText.trim();

        this.inputText = '';
        const input = this.template.querySelector('.agent-input');
        if (input) input.value = '';

        if (message) {
            await execute(message, BOT_ID);
        } else {
            await open(BOT_ID);
        }
    }
}
