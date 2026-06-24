import { LightningElement, track, api } from 'lwc';

export default class AgentforceLauncher extends LightningElement {
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
        if (event.key === 'Enter') {
            this.launchAgent();
        }
    }

    handleSuggestion(event) {
        this.inputText = event.currentTarget.dataset.text;
        this.launchAgent();
    }

    launchAgent() {
        const message = this.inputText.trim();

        // 入力欄をリセット
        this.inputText = '';
        const input = this.template.querySelector('.agent-input');
        if (input) input.value = '';

        // Lightning ナビゲーションバーの標準 Agentforce ボタンを探してクリック
        const copilotBtn = this._findCopilotButton();
        if (copilotBtn) {
            copilotBtn.click();
            if (message) {
                this._sendMessageWhenReady(message);
            }
        }
    }

    _findCopilotButton() {
        // 優先順に標準 Agentforce ナビボタンを探す
        const selectors = [
            'runtime_einstein_copilot-copilot-panel-launcher button',
            'runtime_einstein_copilot-header-button button',
            'button[title="Agentforce"]',
            'button[aria-label="Agentforce"]',
            'one-app-nav-bar-item-root[data-id*="copilot"] button',
            'one-app-nav-bar-item-root[data-id*="Copilot"] button',
            'one-app-nav-bar-item-root[data-id*="einstein"] button',
            'li[data-id*="copilot"] button',
        ];
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) return el;
        }
        return null;
    }

    _sendMessageWhenReady(message, attempt = 0) {
        if (attempt > 20) return;
        setTimeout(() => {
            const textarea = document.querySelector(
                'runtime_einstein_copilot-copilot-conversation-input textarea,' +
                'textarea[placeholder*="タスク"],' +
                'textarea[placeholder*="質問"],' +
                'textarea[placeholder*="Ask"]'
            );
            if (textarea) {
                // ネイティブ setter でフレームワークの state も更新
                const setter = Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype, 'value'
                ).set;
                setter.call(textarea, message);
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));
                setTimeout(() => {
                    const sendBtn = document.querySelector(
                        'runtime_einstein_copilot-copilot-conversation-input button[type="submit"],' +
                        'runtime_einstein_copilot-copilot-conversation-input button[title="送信"],' +
                        'runtime_einstein_copilot-copilot-conversation-input button[title="Send"]'
                    );
                    if (sendBtn) sendBtn.click();
                }, 300);
            } else {
                this._sendMessageWhenReady(message, attempt + 1);
            }
        }, 500);
    }
}
