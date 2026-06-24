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

        this.inputText = '';
        const input = this.template.querySelector('.agent-input');
        if (input) input.value = '';

        // Shadow DOM を再帰的に辿って Agentforce ナビボタンを探してクリック
        const copilotBtn = this._deepFind(document, this._isCopilotButton);
        if (copilotBtn) {
            copilotBtn.click();
            if (message) {
                this._sendMessageWhenReady(message);
            }
        } else {
            console.warn('[AgentforceLauncher] Agentforce button not found in DOM');
        }
    }

    // Shadow DOM を再帰的に探索して条件に合う最初の要素を返す
    _deepFind(root, predicate) {
        const walker = (node) => {
            if (node.nodeType === Node.ELEMENT_NODE && predicate(node)) return node;
            // shadow root があれば潜る
            if (node.shadowRoot) {
                const found = walker(node.shadowRoot);
                if (found) return found;
            }
            for (const child of node.children || []) {
                const found = walker(child);
                if (found) return found;
            }
            return null;
        };
        return walker(root);
    }

    _isCopilotButton(el) {
        if (el.tagName !== 'BUTTON') return false;
        const title = (el.title || '').toLowerCase();
        const label = (el.getAttribute('aria-label') || '').toLowerCase();
        const text  = (el.textContent || '').toLowerCase();
        return title.includes('agentforce') || title.includes('copilot') || title.includes('einstein') ||
               label.includes('agentforce') || label.includes('copilot') ||
               text.includes('agentforce');
    }

    _sendMessageWhenReady(message, attempt = 0) {
        if (attempt > 20) return;
        setTimeout(() => {
            const textarea = this._deepFind(document, (el) =>
                el.tagName === 'TEXTAREA' && (
                    (el.placeholder || '').includes('タスク') ||
                    (el.placeholder || '').includes('質問') ||
                    (el.placeholder || '').includes('Ask') ||
                    (el.placeholder || '').includes('Help')
                )
            );
            if (textarea) {
                const setter = Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype, 'value'
                ).set;
                setter.call(textarea, message);
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));
                setTimeout(() => {
                    const sendBtn = this._deepFind(textarea.getRootNode(), (el) =>
                        el.tagName === 'BUTTON' && (
                            el.type === 'submit' ||
                            (el.title || '').includes('送信') ||
                            (el.title || '').includes('Send') ||
                            (el.getAttribute('aria-label') || '').includes('送信')
                        )
                    );
                    if (sendBtn) sendBtn.click();
                }, 300);
            } else {
                this._sendMessageWhenReady(message, attempt + 1);
            }
        }, 500);
    }
}
