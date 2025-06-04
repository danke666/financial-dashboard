// Financial data
const financialData = [
    {"year": 2016, "total_balance": 9037, "fixed_assets": 5365, "equity": 4507, "long_term_assets": 5521, "short_term_assets": 3516},
    {"year": 2017, "total_balance": 9693, "fixed_assets": 5719, "equity": 4311, "long_term_assets": 5749, "short_term_assets": 3944},
    {"year": 2018, "total_balance": 9277, "fixed_assets": 5037, "equity": 3449, "long_term_assets": 5151, "short_term_assets": 4126},
    {"year": 2019, "total_balance": 9277, "fixed_assets": 5037, "equity": 3449, "long_term_assets": 5151, "short_term_assets": 4126},
    {"year": 2020, "total_balance": 10469, "fixed_assets": 4326, "equity": 2521, "long_term_assets": 4423, "short_term_assets": 6046},
    {"year": 2021, "total_balance": 11774, "fixed_assets": 4802, "equity": 3129, "long_term_assets": 4985, "short_term_assets": 7253},
    {"year": 2022, "total_balance": 11847, "fixed_assets": 9586, "equity": 3386, "long_term_assets": 9677, "short_term_assets": 7146},
    {"year": 2023, "total_balance": 16823, "fixed_assets": 10285, "equity": 7463, "long_term_assets": 10339, "short_term_assets": 7349}
];

const growthRates = [
    {"year": 2017, "total_balance_growth": 7.26, "fixed_assets_growth": 6.60, "equity_growth": -4.35},
    {"year": 2018, "total_balance_growth": -4.29, "fixed_assets_growth": -11.93, "equity_growth": -20.00},
    {"year": 2019, "total_balance_growth": 0.00, "fixed_assets_growth": 0.00, "equity_growth": 0.00},
    {"year": 2020, "total_balance_growth": 12.85, "fixed_assets_growth": -14.12, "equity_growth": -26.91},
    {"year": 2021, "total_balance_growth": 12.47, "fixed_assets_growth": 11.00, "equity_growth": 24.12},
    {"year": 2022, "total_balance_growth": 0.62, "fixed_assets_growth": 99.63, "equity_growth": 8.21},
    {"year": 2023, "total_balance_growth": 42.00, "fixed_assets_growth": 7.29, "equity_growth": 120.41}
];

// Chart color scheme
const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];

// Metric names mapping
const metricNames = {
    'total_balance': 'Общий баланс',
    'fixed_assets': 'Основные средства', 
    'equity': 'Собственный капитал',
    'long_term_assets': 'Долгосрочные активы',
    'short_term_assets': 'Краткосрочные активы'
};

// Chart instances
let mainChart = null;
let growthChart = null;
let structureChart = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupEventListeners();
    updateMetricsTable();
    updateAnalyticsSummary();
});

function setupEventListeners() {
    // Metric selector
    document.getElementById('metric-select').addEventListener('change', updateMainChart);
    
    // Year checkboxes
    const yearCheckboxes = document.querySelectorAll('.year-checkbox input');
    yearCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCharts);
    });
    
    // Units toggle
    const unitsRadios = document.querySelectorAll('input[name="units"]');
    unitsRadios.forEach(radio => {
        radio.addEventListener('change', updateCharts);
    });
    
    // Show trend checkbox
    document.getElementById('show-trend').addEventListener('change', updateMainChart);
    
    // Structure year selector
    document.getElementById('structure-year').addEventListener('change', updateStructureChart);
}

function getSelectedYears() {
    const yearCheckboxes = document.querySelectorAll('.year-checkbox input:checked');
    return Array.from(yearCheckboxes).map(cb => parseInt(cb.value)).sort();
}

function getSelectedUnits() {
    const unitsRadio = document.querySelector('input[name="units"]:checked');
    return unitsRadio.value;
}

function formatValue(value, units) {
    if (units === 'millions') {
        return (value / 1000).toFixed(1);
    }
    return value.toString();
}

function getUnitLabel(units) {
    return units === 'millions' ? 'млн руб.' : 'тыс. руб.';
}

function initializeCharts() {
    createMainChart();
    createGrowthChart();
    createStructureChart();
}

function createMainChart() {
    const ctx = document.getElementById('main-chart').getContext('2d');
    const selectedMetric = document.getElementById('metric-select').value;
    const selectedYears = getSelectedYears();
    const units = getSelectedUnits();
    const showTrend = document.getElementById('show-trend').checked;
    
    const filteredData = financialData.filter(item => selectedYears.includes(item.year));
    const labels = filteredData.map(item => item.year);
    const values = filteredData.map(item => parseFloat(formatValue(item[selectedMetric], units)));
    
    const datasets = [{
        label: metricNames[selectedMetric],
        data: values,
        borderColor: chartColors[0],
        backgroundColor: chartColors[0] + '20',
        borderWidth: 3,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: chartColors[0],
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
    }];
    
    // Add trend line if enabled
    if (showTrend && values.length > 1) {
        const trendData = calculateTrendLine(labels, values);
        datasets.push({
            label: 'Тренд',
            data: trendData,
            borderColor: chartColors[2],
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0
        });
    }
    
    if (mainChart) {
        mainChart.destroy();
    }
    
    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${metricNames[selectedMetric]} (${getUnitLabel(units)})`,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} ${getUnitLabel(units)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Год'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: `Значение (${getUnitLabel(units)})`
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function createGrowthChart() {
    const ctx = document.getElementById('growth-chart').getContext('2d');
    const selectedYears = getSelectedYears();
    
    const filteredGrowthData = growthRates.filter(item => selectedYears.includes(item.year));
    const labels = filteredGrowthData.map(item => item.year);
    const totalBalanceGrowth = filteredGrowthData.map(item => item.total_balance_growth);
    const fixedAssetsGrowth = filteredGrowthData.map(item => item.fixed_assets_growth);
    const equityGrowth = filteredGrowthData.map(item => item.equity_growth);
    
    // Color coding for extreme changes
    const getBarColor = (value) => {
        if (Math.abs(value) > 50) return chartColors[2]; // Red for extreme changes
        if (value > 0) return chartColors[0]; // Blue for positive
        return chartColors[4]; // Dark blue for negative
    };
    
    if (growthChart) {
        growthChart.destroy();
    }
    
    growthChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Общий баланс',
                data: totalBalanceGrowth,
                backgroundColor: totalBalanceGrowth.map(getBarColor),
                borderWidth: 1
            }, {
                label: 'Основные средства',
                data: fixedAssetsGrowth,
                backgroundColor: fixedAssetsGrowth.map(getBarColor),
                borderWidth: 1
            }, {
                label: 'Собственный капитал',
                data: equityGrowth,
                backgroundColor: equityGrowth.map(getBarColor),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Темпы роста финансовых показателей (%)',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Год'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Темп роста (%)'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

function createStructureChart() {
    const ctx = document.getElementById('structure-chart').getContext('2d');
    const selectedYear = parseInt(document.getElementById('structure-year').value);
    
    const yearData = financialData.find(item => item.year === selectedYear);
    
    if (structureChart) {
        structureChart.destroy();
    }
    
    structureChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Долгосрочные активы', 'Краткосрочные активы'],
            datasets: [{
                data: [yearData.long_term_assets, yearData.short_term_assets],
                backgroundColor: [chartColors[0], chartColors[1]],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Структура активов на ${selectedYear} год`,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                            return `${context.label}: ${context.parsed} тыс. руб. (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function calculateTrendLine(xValues, yValues) {
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return xValues.map(x => slope * x + intercept);
}

function updateCharts() {
    updateMainChart();
    updateGrowthChart();
}

function updateMainChart() {
    createMainChart();
}

function updateGrowthChart() {
    createGrowthChart();
}

function updateStructureChart() {
    createStructureChart();
}

function updateMetricsTable() {
    const tbody = document.getElementById('metrics-tbody');
    const units = getSelectedUnits();
    
    const data2023 = financialData.find(item => item.year === 2023);
    const data2016 = financialData.find(item => item.year === 2016);
    
    const metrics = [
        'total_balance',
        'fixed_assets', 
        'equity',
        'long_term_assets',
        'short_term_assets'
    ];
    
    tbody.innerHTML = '';
    
    metrics.forEach(metric => {
        const value2023 = formatValue(data2023[metric], units);
        const value2016 = formatValue(data2016[metric], units);
        const change = ((data2023[metric] - data2016[metric]) / data2016[metric] * 100).toFixed(1);
        const status = parseFloat(change) > 0 ? 'positive' : parseFloat(change) < 0 ? 'negative' : 'neutral';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${metricNames[metric]}</td>
            <td>${value2023} ${getUnitLabel(units)}</td>
            <td>${value2016} ${getUnitLabel(units)}</td>
            <td class="status-${status}">${change > 0 ? '+' : ''}${change}%</td>
            <td><span class="status status--${status === 'positive' ? 'success' : status === 'negative' ? 'error' : 'info'}">${status === 'positive' ? 'Рост' : status === 'negative' ? 'Снижение' : 'Стабильно'}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function updateAnalyticsSummary() {
    const summaryContent = document.getElementById('summary-content');
    
    // Calculate key insights
    const totalBalanceGrowth2023 = growthRates.find(item => item.year === 2023).total_balance_growth;
    const maxGrowthYear = growthRates.reduce((max, item) => 
        item.total_balance_growth > max.total_balance_growth ? item : max
    );
    const minGrowthYear = growthRates.reduce((min, item) => 
        item.total_balance_growth < min.total_balance_growth ? item : min
    );
    
    // Calculate average growth
    const avgGrowth = (growthRates.reduce((sum, item) => sum + item.total_balance_growth, 0) / growthRates.length).toFixed(1);
    
    // Find years with extreme changes (>50%)
    const extremeChanges = growthRates.filter(item => 
        Math.abs(item.total_balance_growth) > 50 || 
        Math.abs(item.fixed_assets_growth) > 50 || 
        Math.abs(item.equity_growth) > 50
    );
    
    summaryContent.innerHTML = `
        <div class="summary-item">
            <h3>Динамика роста</h3>
            <p>В 2023 году наблюдался <span class="summary-highlight">значительный рост</span> общего баланса на ${totalBalanceGrowth2023}%. Средний темп роста за период составил ${avgGrowth}% в год.</p>
        </div>
        <div class="summary-item">
            <h3>Экстремальные изменения</h3>
            <p>Наибольший рост зафиксирован в <span class="summary-highlight">${maxGrowthYear.year} году</span> (+${maxGrowthYear.total_balance_growth}%), наибольшее снижение в <span class="summary-highlight">${minGrowthYear.year} году</span> (${minGrowthYear.total_balance_growth}%).</p>
        </div>
        <div class="summary-item">
            <h3>Структурные изменения</h3>
            <p>Выявлено <span class="summary-highlight">${extremeChanges.length} периодов</span> с резкими изменениями показателей (более 50%). Особое внимание требуют 2022-2023 годы с существенным ростом основных средств.</p>
        </div>
        <div class="summary-item">
            <h3>Общая тенденция</h3>
            <p>За анализируемый период компания демонстрирует <span class="summary-highlight">позитивную динамику</span> с периодами стабилизации и значительного роста в последние годы.</p>
        </div>
    `;
}