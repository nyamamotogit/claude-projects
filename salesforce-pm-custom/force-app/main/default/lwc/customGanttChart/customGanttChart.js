import { LightningElement, api, wire } from 'lwc';
import getGanttData from '@salesforce/apex/CustomGanttChartController.getGanttData';

export default class CustomGanttChart extends LightningElement {
    @api recordId;
    tasks = [];
    error;

    @wire(getGanttData, { projectId: '$recordId' })
    wiredTasks({ error, data }) {
        if (data) {
            this.tasks = data.map(task => ({
                ...task,
                statusClass: this.getStatusClass(task.status),
                priorityBadge: this.getPriorityBadge(task.priority),
                dueDateFormatted: this.formatDate(task.dueDate)
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.tasks = [];
        }
    }

    getStatusClass(status) {
        const statusMap = {
            'Not Started': 'slds-badge slds-theme_default',
            'In Progress': 'slds-badge slds-theme_warning',
            'Completed': 'slds-badge slds-theme_success',
            'Blocked': 'slds-badge slds-theme_error'
        };
        return statusMap[status] || 'slds-badge';
    }

    getPriorityBadge(priority) {
        const priorityMap = {
            'High': 'slds-badge slds-theme_error',
            'Medium': 'slds-badge slds-theme_warning',
            'Low': 'slds-badge slds-theme_info'
        };
        return priorityMap[priority] || 'slds-badge';
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    get hasNoTasks() {
        return this.tasks.length === 0;
    }
}
