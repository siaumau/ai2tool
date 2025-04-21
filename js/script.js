// 遊戲變數
let canvas = document.getElementById('game-canvas');
let ctx = canvas.getContext('2d');
let scoreElement = document.getElementById('score');
let restartBtn = document.getElementById('restart-btn');
let snake = [];
let food = null;
let direction = 'right';
let score = 0;
let gameOver = false;

// 初始化遊戲
function init() {
    // 初始化蛇的位置
    snake = [
        {x: 100, y: 100},
        {x: 90, y: 100},
        {x: 80, y: 100}
    ];
    // 初始化食物的位置
    food = generateFood();
    // 初始化方向
    direction = 'right';
    // 初始化分數
    score = 0;
    scoreElement.textContent = `分數：${score}`;
    // 初始化遊戲狀態
    gameOver = false;
    // 渲染遊戲
    render();
    // 綁定鍵盤事件
    document.addEventListener('keydown', handleKeyDown);
    // 綁定重玩按鈕事件
    restartBtn.addEventListener('click', restart);
    // 開始遊戲迴圈
    gameLoop();
}

// 生成食物的位置
function generateFood() {
    let x = Math.floor(Math.random() * (canvas.width / 10)) * 10;
    let y = Math.floor(Math.random() * (canvas.height / 10)) * 10;
    return {x, y};
}

// 處理鍵盤事件
function handleKeyDown(e) {
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
    }
}

// 遊戲迴圈
function gameLoop() {
    if (gameOver) return;
    // 更新遊戲狀態
    update();
    // 渲染遊戲
    render();
    // 遞迴呼叫遊戲迴圈
    setTimeout(gameLoop, 100);
}

// 更新遊戲狀態
function update() {
    // 移動蛇的位置
    let head = snake[0];
    let newHead = null;
    switch (direction) {
        case 'up':
            newHead = {x: head.x, y: head.y - 10};
            break;
        case 'down':
            newHead = {x: head.x, y: head.y + 10};
            break;
        case 'left':
            newHead = {x: head.x - 10, y: head.y};
            break;
        case 'right':
            newHead = {x: head.x + 10, y: head.y};
            break;
    }
    snake.unshift(newHead);
    // 檢查是否吃到食物
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        scoreElement.textContent = `分數：${score}`;
        food = generateFood();
    } else {
        snake.pop();
    }
    // 檢查是否碰到牆壁或自己
    if (newHead.x < 0 || newHead.x >= canvas.width || newHead.y < 0 || newHead.y >= canvas.height || snake.slice(1).some(part => part.x === newHead.x && part.y === newHead.y)) {
        gameOver = true;
    }
}

// 渲染遊戲
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 繪製蛇
    ctx.fillStyle = '#0f0';
    snake.forEach(part => ctx.fillRect(part.x, part.y, 10, 10));
    // 繪製食物
    ctx.fillStyle = '#f00';
    ctx.fillRect(food.x, food.y, 10, 10);
    // 繪製遊戲結束文字
    if (gameOver) {
        ctx.font = '24px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('遊戲結束！', canvas.width / 2, canvas.height / 2);
    }
}

// 重玩遊戲
function restart() {
    init();
}

init();