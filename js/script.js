// Sample sales data
const salesData = {
    daily: {
        labels: ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5'],
        barData: [12, 19, 3, 5, 2],
        lineData: [2, 8, 5, 20, 13]
    },
    weekly: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        barData: [6, 11, 15, 7, 9],
        lineData: [3, 10, 14, 8, 12]
    },
    monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        barData: [10, 15, 20, 18, 22],
        lineData: [4, 12, 18, 15, 20]
    }
};

// Function to update charts
function updateCharts(timePeriod) {
    const data = salesData[timePeriod];

    const barChartCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barChartCtx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Sales',
                data: data.barData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const lineChartCtx = document.getElementById('lineChart').getContext('2d');
    new Chart(lineChartCtx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Sales',
                data: data.lineData,
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: true
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Event listener for time period selection
document.getElementById('time-period').addEventListener('change', function() {
    const timePeriod = this.value;
    updateCharts(timePeriod);
});

// Initialize charts with default time period
updateCharts('daily');