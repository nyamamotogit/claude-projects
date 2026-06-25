import { LightningElement, api, track, wire } from 'lwc';
import { open, execute } from 'lightning/accApi';
import getBotId from '@salesforce/apex/EmployeeAgentController.getBotId';

export default class AgentforceInputLauncherShort extends LightningElement {
    @api titleText = 'Agentforce がお手伝いします';
    @api placeholderText = 'Agentforce に質問する...';
    @api botId; // App Builder から DeveloperName が渡される

    @track inputText = '';
    _resolvedBotId;

    // DeveloperName から BotDefinition.Id を解決
    @wire(getBotId, { developerName: '$botId' })
    wiredBotId({ data, error }) {
        if (data) {
            this._resolvedBotId = data;
        } else if (error) {
            console.error('[AgentforceInputLauncherShort] getBotId error:', error);
        }
    }

    handleInput(event) {
        this.inputText = event.target.value;
    }

    handleKeydown(event) {
        if (event.key === 'Enter' && !event.isComposing) {
            this.handleSubmit();
        }
    }

    async handleSubmit() {
        const message = this.inputText.trim();

        this.inputText = '';
        const input = this.template.querySelector('.agent-input');
        if (input) input.value = '';

        const id = this._resolvedBotId;
        if (message) {
            await execute(message, id);
        } else {
            await open(id);
        }
    }
}
