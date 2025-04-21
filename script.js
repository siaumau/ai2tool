// script.js
// 銷售數據
const salesData = {
    week: {
        labels: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
        barData: [100, 120, 150, 180, 200, 220, 250],
        lineData: [50, 60, 70, 80, 90, 100, 110]
    },
    month: {
        labels: ['第1週', '第2週', '第3週', '第4週'],
        barData: [500, 600, 700, 800],
        lineData: [200, 250, 300, 350]
    },
    quarter: {
        labels: ['第1月', '第2月', '第3月'],
        barData: [1500, 1800, 2000],
        lineData: [600, 700, 800]
    }
};

// 初始化 Chart.js
const barCtx = document.getElementById('barChart').getContext('2d');
const lineCtx = document.getElementById('lineChart').getContext('2d');
let barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
        labels: salesData.week.labels,
        datasets: [{
            label: '銷售額',
            data: salesData.week.barData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
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

let lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
        labels: salesData.week.labels,
        datasets: [{
            label: '利潤',
            data: salesData.week.lineData,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: 'rgba(54, 162, 235, 1)',
            pointRadius: 5
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

// 切換時間段
document.getElementById('time-period').addEventListener('change', (e) => {
    const timePeriod = e.target.value;
    const data = salesData[timePeriod];

    barChart.data.labels = data.labels;
    barChart.data.datasets[0].data = data.barData;
    barChart.update();

    lineChart.data.labels = data.labels;
    lineChart.data.datasets[0].data = data.lineData;
    lineChart.update();
});