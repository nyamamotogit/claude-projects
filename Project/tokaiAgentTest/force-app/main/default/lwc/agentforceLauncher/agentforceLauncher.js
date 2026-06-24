import { LightningElement, track, api } from 'lwc';

export default class AgentforceLauncher extends LightningElement {
    @api agentDeveloperName = 'Agentforce_Employee_Agent';
    @api titleText = 'Agentforce がお手伝いします';
    @api placeholderText = 'Agentforce に質問する...';
    @api showSuggestions = false;
    @api suggestionList = '休暇申請の方法は？,経費精算のやり方,社内規程を教えて';

    @track inputText = '';

    get suggestions() {
        return this.suggestionList ? this.suggestionList.split(',').map(s => s.trim()) : [];
    }

    get isInputEmpty() {
        return !this.inputText || this.inputText.trim() === '';
    }

    get sendButtonClass() {
        return this.isInputEmpty ? 'send-button send-button-disabled' : 'send-button send-button-active';
    }

    handleInput(event) {
        this.inputText = event.target.value;
    }

    handleKeydown(event) {
        if (event.key === 'Enter' && !this.isInputEmpty) {
            this.launchAgent();
        }
    }

    handleSuggestion(event) {
        this.inputText = event.currentTarget.dataset.text;
        this.launchAgent();
    }

    launchAgent() {
        const message = this.inputText.trim();
        // EmbeddedMessagingBus でエージェントを起動し初期メッセージを送信
        try {
            if (typeof embeddedservice_bootstrap !== 'undefined') {
                embeddedservice_bootstrap.utilAPI.launchChat();
                if (message) {
                    // チャット起動後に初期メッセージをセット
                    const sendInitial = () => {
                        const evt = new CustomEvent('agentforcelauncher', {
                            detail: { message },
                            bubbles: true,
                            composed: true
                        });
                        this.dispatchEvent(evt);
                        // Embedded Messaging の入力欄にテキストをセット
                        const iframe = document.querySelector('embeddedMessagingFrame');
                        if (iframe) {
                            iframe.contentWindow.postMessage(
                                { method: 'setInputText', text: message },
                                '*'
                            );
                        }
                    };
                    setTimeout(sendInitial, 800);
                }
            } else {
                // フォールバック: Copilot パネルを開く
                this.openCopilotPanel(message);
            }
        } catch (e) {
            this.openCopilotPanel(message);
        }
        this.inputText = '';
        const input = this.template.querySelector('.agent-input');
        if (input) input.value = '';
    }

    openCopilotPanel(message) {
        // Lightning Copilot を直接開く（Employee Agent）
        const url = message
            ? `/einstein/aiAssistant?initialMessage=${encodeURIComponent(message)}`
            : '/einstein/aiAssistant';
        window.open(url, '_blank', 'width=400,height=700,resizable=yes');
    }
}
