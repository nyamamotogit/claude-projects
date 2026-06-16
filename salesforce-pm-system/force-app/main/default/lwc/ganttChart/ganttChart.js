import { LightningElement, api, wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import D3 from '@salesforce/resourceUrl/d3';
import getGanttData from '@salesforce/apex/GanttChartController.getGanttData';
import getMilestones from '@salesforce/apex/GanttChartController.getMilestones';

export default class GanttChart extends LightningElement {
    @api recordId;
    d3Initialized = false;
    tasks = [];
    milestones = [];

    @wire(getGanttData, { projectId: '$recordId' })
    wiredTasks({ error, data }) {
        if (data) {
            this.tasks = data;
            if (this.d3Initialized) {
                this.renderGantt();
            }
        } else if (error) {
            console.error('Error loading tasks:', error);
        }
    }

    @wire(getMilestones, { projectId: '$recordId' })
    wiredMilestones({ error, data }) {
        if (data) {
            this.milestones = data;
            if (this.d3Initialized) {
                this.renderGantt();
            }
        }
    }

    renderedCallback() {
        if (this.d3Initialized) {
            return;
        }

        loadScript(this, D3)
            .then(() => {
                this.d3Initialized = true;
                this.renderGantt();
            })
            .catch(error => {
                console.error('Error loading D3:', error);
            });
    }

    renderGantt() {
        if (!this.tasks || this.tasks.length === 0) return;

        const container = this.template.querySelector('.gantt-container');
        if (!container) return;

        container.innerHTML = '';

        const margin = { top: 50, right: 30, bottom: 50, left: 200 };
        const width = container.offsetWidth - margin.left - margin.right;
        const height = this.tasks.length * 40 + margin.top + margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const parseDate = d3.timeParse('%Y-%m-%d');
        const tasks = this.tasks.map(t => ({
            ...t,
            startDate: parseDate(t.startDate),
            endDate: parseDate(t.endDate)
        }));

        const minDate = d3.min(tasks, d => d.startDate);
        const maxDate = d3.max(tasks, d => d.endDate);
        const today = new Date();

        const xScale = d3.scaleTime()
            .domain([minDate, maxDate])
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(tasks.map(t => t.name))
            .range([0, tasks.length * 40])
            .padding(0.2);

        // X軸
        svg.append('g')
            .attr('class', 'x-axis')
            .call(d3.axisTop(xScale).ticks(d3.timeWeek))
            .selectAll('text')
            .style('text-anchor', 'start')
            .attr('transform', 'rotate(-45)');

        // Y軸
        svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale));

        // 今日のライン
        svg.append('line')
            .attr('x1', xScale(today))
            .attr('x2', xScale(today))
            .attr('y1', 0)
            .attr('y2', tasks.length * 40)
            .attr('stroke', '#E74C3C')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');

        // タスクバー
        const colorMap = {
            'Not Started': '#E0E0E0',
            'In Progress': '#4A90E2',
            'Completed': '#7ED321',
            'Blocked': '#D0021B'
        };

        tasks.forEach(task => {
            const barGroup = svg.append('g');

            const barWidth = xScale(task.endDate) - xScale(task.startDate);

            // 背景バー
            barGroup.append('rect')
                .attr('x', xScale(task.startDate))
                .attr('y', yScale(task.name))
                .attr('width', barWidth)
                .attr('height', yScale.bandwidth())
                .attr('fill', colorMap[task.status] || '#CCC')
                .attr('rx', 3);

            // 進捗バー
            if (task.progress > 0) {
                barGroup.append('rect')
                    .attr('x', xScale(task.startDate))
                    .attr('y', yScale(task.name))
                    .attr('width', barWidth * (task.progress / 100))
                    .attr('height', yScale.bandwidth())
                    .attr('fill', this.getDarkerColor(colorMap[task.status]))
                    .attr('rx', 3);
            }

            // ホバー時の詳細表示
            barGroup.append('title')
                .text(`${task.name}\n担当: ${task.assignedTo}\n進捗: ${task.progress}%\n期間: ${task.startDate} - ${task.endDate}`);
        });

        // マイルストーン
        if (this.milestones && this.milestones.length > 0) {
            this.milestones.forEach(ms => {
                const msDate = parseDate(ms.dueDate);
                svg.append('polygon')
                    .attr('points', this.getDiamondPoints(xScale(msDate), tasks.length * 40 / 2))
                    .attr('fill', '#F39C12')
                    .append('title')
                    .text(`マイルストーン: ${ms.name}`);
            });
        }
    }

    getDarkerColor(color) {
        const darkenMap = {
            '#E0E0E0': '#A0A0A0',
            '#4A90E2': '#2E5C8A',
            '#7ED321': '#5A9B18',
            '#D0021B': '#8B0112'
        };
        return darkenMap[color] || color;
    }

    getDiamondPoints(x, y) {
        const size = 8;
        return `${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`;
    }
}
