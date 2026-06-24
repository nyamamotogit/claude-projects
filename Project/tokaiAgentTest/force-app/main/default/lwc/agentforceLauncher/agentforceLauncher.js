import { LightningElement, api } from 'lwc';
import { open } from 'lightning/accApi';

const BOT_ID = '0XxId000000PNAVKA4';

export default class AgentforceLauncher extends LightningElement {
    @api titleText = 'Agentforce がお手伝いします';
    // 後方互換のため残す（App Builder上で削除不可）
    @api placeholderText;
    @api showSuggestions;
    @api suggestionList;

    async launchAgent() {
        await open(BOT_ID);
    }
}
