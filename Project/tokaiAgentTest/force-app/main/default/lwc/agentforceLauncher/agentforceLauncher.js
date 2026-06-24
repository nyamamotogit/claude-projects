import { LightningElement, track, api } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import { wire } from 'lwc';

export default class AgentforceLauncher extends LightningElement {
    @api titleText = 'Agentforce がお手伝いします';
    @api placeholderText = 'Agentforce に質問する...';
    @api showSuggestions = false;
    @api suggestionList = '休暇申請の方法は？,経費精算のやり方,社内規程を教えて';

    @track inputText = '';

    @wire(MessageContext) messageContext;

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

        // 入力欄をリセット
        this.inputText = '';
        const input = this.template.querySelector('.agent-input');
        if (input) input.value = '';

        // 標準 Agentforce パネルを開く（グローバルアクション経由）
        const copilotButton = document.querySelector('[title="Agentforce"]') ||
                              document.querySelector('.copilotLauncher button') ||
                              document.querySelector('button[data-key="copilot"]');

        if (copilotButton) {
            copilotButton.click();
            if (message) {
                this._sendMessageWhenReady(message);
            }
        } else {
            // フォールバック: グローバルアクション名で起動
            const event = new CustomEvent('globalaction', {
                detail: { actionName: 'lightning__openCopilot' },
                bubbles: true,
                composed: true
            });
            document.dispatchEvent(event);
            if (message) {
                this._sendMessageWhenReady(message);
            }
        }
    }

    _sendMessageWhenReady(message, attempt = 0) {
        if (attempt > 15) return;
        setTimeout(() => {
            // Agentforce パネルのテキストエリアを探す
            const textarea = document.querySelector(
                'copilot-panel textarea, ' +
                '.copilot-chat-input textarea, ' +
                'textarea[placeholder*="タスク"], ' +
                'textarea[placeholder*="質問"]'
            );
            if (textarea) {
                // ネイティブ input イベントで React/LWC の state を更新
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype, 'value'
                ).set;
                nativeInputValueSetter.call(textarea, message);
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));

                // 送信ボタンを探してクリック
                setTimeout(() => {
                    const sendBtn = textarea.closest('form, .copilot-chat-input')
                        ?.querySelector('button[type="submit"], button[data-key="send"]');
                    if (sendBtn) sendBtn.click();
                }, 200);
            } else {
                this._sendMessageWhenReady(message, attempt + 1);
            }
        }, 400);
    }
}
