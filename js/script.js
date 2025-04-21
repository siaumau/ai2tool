// 取得 Canvas 元素
const ctx = document.getElementById('chart').getContext('2d');

// 銷售數據
const salesData = {
    week: {
        labels: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
        sales: [100, 150, 120, 180, 200, 150, 120],
        profits: [50, 75, 60, 90, 100, 75, 60]
    },
    month: {
        labels: ['第1周', '第2周', '第3周', '第4周'],
        sales: [500, 600, 550, 650],
        profits: [250, 300, 275, 325]
    },
    quarter: {
        labels: ['第1月', '第2月', '第3月'],
        sales: [2000, 2200, 2100],
        profits: [1000, 1100, 1050]
    }
};

// 初始化 Chart.js
let chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: salesData.week.labels,
        datasets: [{
            label: '銷售額',
            data: salesData.week.sales,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        },
        {
            label: '利潤',
            data: salesData.week.profits,
            type: 'line',
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 3,
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
    const selectedPeriod = e.target.value;
    chart.data.labels = salesData[selectedPeriod].labels;
    chart.data.datasets[0].data = salesData[selectedPeriod].sales;
    chart.data.datasets[1].data = salesData[selectedPeriod].profits;
    chart.update();
});