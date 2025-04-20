document.addEventListener('DOMContentLoaded', function() {
    // Element References
    const singleColumnLayout = document.getElementById('singleColumnLayout');
    const twoColumnLayout = document.getElementById('twoColumnLayout');
    const waitingForIdeaContainer = document.getElementById('waitingForIdeaContainer');
    const promptForm = document.getElementById('promptForm');
    const promptFormSplit = document.getElementById('promptFormSplit');
    const promptInput = document.getElementById('promptInput');
    const promptInputSplit = document.getElementById('promptInputSplit');
    const generateBtn = document.getElementById('generateBtn');
    const generateBtnSplit = document.getElementById('generateBtnSplit');
    const imageUpload = document.getElementById('imageUpload');
    const imageUploadSplit = document.getElementById('imageUploadSplit');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreviewContainerSplit = document.getElementById('imagePreviewContainerSplit');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewSplit = document.getElementById('imagePreviewSplit');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const removeImageBtnSplit = document.getElementById('removeImageBtnSplit');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelSelect = document.getElementById('modelSelect');
    const codeTabBtn = document.getElementById('codeTabBtn');
    const previewTabBtn = document.getElementById('previewTabBtn');
    const codeTab = document.getElementById('codeTab');
    const previewTab = document.getElementById('previewTab');
    const generatedCodeElement = document.getElementById('generatedCode'); // Renamed to avoid conflict
    const previewFrame = document.getElementById('previewFrame');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    const generationProcess = document.getElementById('generationProcess');
    const processSteps = document.getElementById('processSteps').querySelectorAll('.process-step');
    const templateBtns = document.querySelectorAll('.template-btn');
    const apiKeyForm = document.getElementById('apiKeyForm'); // Get the form element

    // Application State
    let state = {
        prompt: '',
        apiKey: localStorage.getItem('openRouterApiKey') || '',
        selectedModel: localStorage.getItem('selectedModel') || 'anthropic/claude-3-opus-20240229',
        imageFile: null,
        isGenerating: false,
        codeGenerated: false,
        currentStep: -1, // Initialize to -1
        generatedContent: null
    };

    // Initialization
    function init() {
        apiKeyInput.value = state.apiKey;
        modelSelect.value = state.selectedModel;

        // Sync textareas
        promptInput.addEventListener('input', function() {
            state.prompt = this.value;
            promptInputSplit.value = this.value;
        });

        promptInputSplit.addEventListener('input', function() {
            state.prompt = this.value;
            promptInput.value = this.value;
        });

        // Template button clicks
        templateBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const templateType = this.innerText.trim(); // Use innerText for text content
                setTemplatePrompt(templateType);
            });
        });

        // Settings modal interactions
        settingsBtn.addEventListener('click', toggleSettingsModal);
        closeSettingsBtn.addEventListener('click', toggleSettingsModal);
        // saveSettingsBtn click is handled by form submit now

         // Handle API Key form submission specifically
        if (apiKeyForm) {
            apiKeyForm.addEventListener('submit', function(e) {
                e.preventDefault(); // Prevent default form submission
                saveSettings(); // Call the save function
            });
        } else {
            console.error("API Key Form not found!");
        }


        // Main form submissions
        promptForm.addEventListener('submit', handleSubmit);
        promptFormSplit.addEventListener('submit', handleSubmit);

        // Image handling
        imageUpload.addEventListener('change', handleImageUpload);
        imageUploadSplit.addEventListener('change', handleImageUpload);
        removeImageBtn.addEventListener('click', removeImage);
        removeImageBtnSplit.addEventListener('click', removeImage);

        // Tab switching
        codeTabBtn.addEventListener('click', () => switchTab('code'));
        previewTabBtn.addEventListener('click', () => switchTab('preview'));

        // Close settings modal on outside click
        window.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                toggleSettingsModal();
            }
        }); // Removed passive: true as it might interfere with modal logic

        // Add passive listeners for scroll/touch (good practice, but check if needed)
        document.addEventListener('scroll', function() {}, { passive: true });
        document.addEventListener('touchstart', function() {}, { passive: true });
        document.addEventListener('touchmove', function() {}, { passive: true });

        // Initial render adjustments
        if (state.codeGenerated) { // Restore state if needed on reload
           switchToTwoColumnLayout();
           completeGeneration(state.generatedContent); // Re-render code/preview
        }
    }

    // Set Template Prompt
    function setTemplatePrompt(templateType) {
        let promptText = '';
        switch(templateType) {
            case '互動式網頁':
                promptText = '創建一個互動式網頁，包含一個簡單的表單和動態顯示結果的區域。使用現代CSS設計，支持響應式佈局。';
                break;
            case '遊戲':
                promptText = '創建一個簡單的貪吃蛇遊戲，使用HTML5 Canvas。蛇應該能夠通過鍵盤操控，吃到食物後會變長，碰到牆壁或自己會結束遊戲。';
                break;
            case '數據可視化':
                promptText = '創建一個數據可視化面板，使用柱狀圖和折線圖展示一組銷售數據。包含互動元素，讓用戶可以切換顯示不同時間段的數據。';
                break;
            default:
                 console.warn("Unknown template type:", templateType);
        }
        if (promptText) {
            promptInput.value = promptText;
            promptInputSplit.value = promptText;
            state.prompt = promptText;
            promptInput.focus(); // Optional: focus after setting template
        }
    }

    // Handle Image Upload
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            state.imageFile = file;
            const reader = new FileReader();
            reader.onloadend = function() {
                const imageUrl = reader.result;
                imagePreview.src = imageUrl;
                imagePreviewSplit.src = imageUrl;
                imagePreviewContainer.classList.remove('hidden');
                imagePreviewContainerSplit.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    }

    // Remove Image
    function removeImage() {
        state.imageFile = null;
        imageUpload.value = ''; // Reset file input
        imageUploadSplit.value = ''; // Reset file input
        imagePreview.src = ''; // Clear preview src
        imagePreviewSplit.src = ''; // Clear preview src
        imagePreviewContainer.classList.add('hidden');
        imagePreviewContainerSplit.classList.add('hidden');
    }

    // Toggle Settings Modal
    function toggleSettingsModal() {
        settingsModal.classList.toggle('hidden');
        // Force reflow for transition if using opacity/transform directly
        // void settingsModal.offsetWidth;
    }

    // Save Settings
    function saveSettings() {
        const newApiKey = apiKeyInput.value.trim();
        const newModel = modelSelect.value;

        if (newApiKey) {
            state.apiKey = newApiKey;
            localStorage.setItem('openRouterApiKey', state.apiKey);
        } else {
            // Optionally handle empty API key case (e.g., show warning)
             console.warn("API Key field is empty. Not saving.");
            // Keep the old key if one existed
             state.apiKey = localStorage.getItem('openRouterApiKey') || '';
             apiKeyInput.value = state.apiKey; // Restore input field if empty save attempted
        }


        state.selectedModel = newModel;
        localStorage.setItem('selectedModel', state.selectedModel);

        console.log("Settings saved. API Key set:", !!state.apiKey, "Model:", state.selectedModel);
        toggleSettingsModal();
    }

    // Switch Code/Preview Tab
    function switchTab(tab) {
        const isCodeTab = tab === 'code';

        codeTab.classList.toggle('hidden', !isCodeTab);
        previewTab.classList.toggle('hidden', isCodeTab);

        codeTabBtn.classList.toggle('text-blue-400', isCodeTab);
        codeTabBtn.classList.toggle('border-b-2', isCodeTab);
        codeTabBtn.classList.toggle('border-blue-500', isCodeTab);
        codeTabBtn.classList.toggle('text-gray-400', !isCodeTab);

        previewTabBtn.classList.toggle('text-blue-400', !isCodeTab);
        previewTabBtn.classList.toggle('border-b-2', !isCodeTab);
        previewTabBtn.classList.toggle('border-blue-500', !isCodeTab);
        previewTabBtn.classList.toggle('text-gray-400', isCodeTab);

        if (!isCodeTab) {
            updatePreview(); // Update preview only when switching to it
        }
    }

    // Update Preview Iframe
    function updatePreview() {
         if (state.generatedContent && previewFrame) {
            try {
               const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow?.document;
               if (previewDoc) {
                   previewDoc.open();
                   // Sanitize or carefully handle generatedContent if it comes from untrusted sources
                   previewDoc.write(state.generatedContent);
                   previewDoc.close();
               } else {
                   console.error("Could not access preview iframe document.");
               }
            } catch (error) {
                 console.error("Error updating preview iframe:", error);
                 // Display error in preview?
                 const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow?.document;
                 if (previewDoc) {
                     previewDoc.open();
                     previewDoc.write(`<html><body><h1>Preview Error</h1><p>${error.message}</p></body></html>`);
                     previewDoc.close();
                 }
            }
        } else if (!state.generatedContent) {
            // Clear preview if no content
             const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow?.document;
             if (previewDoc) {
                   previewDoc.open();
                   previewDoc.write('<html><body></body></html>'); // Empty document
                   previewDoc.close();
             }
        }
    }

     // Switch to Two Column Layout
     function switchToTwoColumnLayout() {
        singleColumnLayout.classList.add('hidden');
        twoColumnLayout.classList.remove('hidden');
        waitingForIdeaContainer.classList.add('hidden'); // Hide waiting area
     }


    // Show Generation Process Step
    function showProcessStep(stepIndex) {
         // Reset previous active state if any
         processSteps.forEach(step => step.classList.remove('active'));

        // Mark previous steps as completed
        for (let i = 0; i < stepIndex; i++) {
            if (processSteps[i]) {
               processSteps[i].classList.remove('hidden', 'active');
               processSteps[i].classList.add('completed');
            }
        }

        // Show and mark current step as active
        if (processSteps[stepIndex]) {
            processSteps[stepIndex].classList.remove('hidden');
            processSteps[stepIndex].classList.add('active');
        }
        state.currentStep = stepIndex;
    }

    // Show all process steps (usually on completion)
    function showAllProcessSteps() {
         processSteps.forEach((step, index) => {
            step.classList.remove('hidden', 'active');
             // Mark all except the last as completed
             if (index < processSteps.length - 1) {
                 step.classList.add('completed');
             } else {
                 // Mark last step also as completed (or active depending on visual preference)
                 step.classList.add('completed'); // Visually shows checkmark
             }
         });
         // If you want the last step to remain 'active' visually
         // if (processSteps.length > 0) {
         //    processSteps[processSteps.length - 1].classList.add('active');
         //    processSteps[processSteps.length - 1].classList.remove('completed');
         // }
         state.currentStep = processSteps.length -1; // Indicate completion
    }

    // Handle Form Submission (Generation Request)
    function handleSubmit(e) {
        e.preventDefault(); // Prevent default form submission
        state.prompt = promptInput.value.trim(); // Update state from active input

        if (!state.prompt) {
            showError('請輸入需求描述');
            promptInput.focus();
            return;
        }

        if (!state.apiKey) {
            showError('請在設置中輸入 OpenRouter API 金鑰');
            // Optionally open settings modal: toggleSettingsModal();
            return;
        }

        switchToTwoColumnLayout(); // Change layout

        // Reset UI elements for new generation
        errorContainer.classList.add('hidden'); // Hide previous errors
        generationProcess.classList.remove('hidden'); // Show progress indicator
        resetProcessSteps(); // Reset steps visual state
        generatedCodeElement.textContent = '// 生成中...'; // Clear previous code
        state.generatedContent = null; // Clear stored content
        updatePreview(); // Clear preview iframe

        showProcessStep(0); // Show first step
        setGeneratingState(true); // Disable button, show loading state

        // ** ACTUAL API CALL WOULD GO HERE **
        // Using simulation for now:
        console.log("Simulating generation for prompt:", state.prompt);
        simulateGeneration();
    }

    // Reset Process Steps Visuals
    function resetProcessSteps() {
        processSteps.forEach(step => {
            step.classList.add('hidden'); // Hide all steps initially
            step.classList.remove('active', 'completed');
        });
        state.currentStep = -1; // Reset step counter
    }

    // Set Generating Button State
    function setGeneratingState(isGenerating) {
        state.isGenerating = isGenerating;

        generateBtn.disabled = isGenerating;
        generateBtnSplit.disabled = isGenerating;

        const btnIcon = generateBtn.querySelector('.generate-icon');
        const btnSpan = generateBtn.querySelector('span');
        const btnSplitIcon = generateBtnSplit.querySelector('.generate-icon');
        const btnSplitSpan = generateBtnSplit.querySelector('span');

        if (isGenerating) {
            generateBtn.classList.add('generating', 'opacity-70', 'cursor-not-allowed');
            generateBtnSplit.classList.add('generating', 'opacity-70', 'cursor-not-allowed');
            if (btnIcon) btnIcon.classList.add('animate-pulse'); // Add pulse to icon
            if (btnSplitIcon) btnSplitIcon.classList.add('animate-pulse');
            if (btnSpan) btnSpan.textContent = '生成中...';
            if (btnSplitSpan) btnSplitSpan.textContent = '生成中...';
        } else {
            generateBtn.classList.remove('generating', 'opacity-70', 'cursor-not-allowed');
            generateBtnSplit.classList.remove('generating', 'opacity-70', 'cursor-not-allowed');
            if (btnIcon) btnIcon.classList.remove('animate-pulse');
            if (btnSplitIcon) btnSplitIcon.classList.remove('animate-pulse');
             if (btnSpan) btnSpan.textContent = '生成';
            if (btnSplitSpan) btnSplitSpan.textContent = '生成';
        }
    }

    // Show Error Message
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
        // Optionally hide progress if error occurs during generation
         generationProcess.classList.add('hidden');
         setGeneratingState(false); // Re-enable button on error
    }

     // Simulate AI Generation Process
     function simulateGeneration() {
         // Example code to return (replace with actual API result)
         const sampleCode = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Snake Game</title>
<style>
body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #1a1d23; margin: 0; font-family: sans-serif; flex-direction: column; color: #e5e7eb; }
#game-container { text-align: center; background-color: #1f2937; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
canvas { border: 1px solid #4b5563; background-color: #111827; display: block; margin: 10px auto; }
h1 { color: #f9fafb; margin-bottom: 10px; font-size: 1.8em; }
#score { color: #9ca3af; font-size: 1.2em; margin-top: 5px; }
#controls { color: #6b7280; margin-top: 15px; font-size: 0.9em; }
#gameOverScreen { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; z-index: 10; font-size: 1.5em; visibility: hidden; opacity: 0; transition: visibility 0s 0.3s, opacity 0.3s linear; }
#gameOverScreen.visible { visibility: visible; opacity: 1; transition: opacity 0.3s linear; }
#gameOverScreen h2 { color: #ef4444; margin-bottom: 15px; font-size: 1.5em; }
#gameOverScreen p { margin: 5px 0; }
#gameOverScreen button { background-color: #2563eb; color: white; border: none; padding: 10px 20px; font-size: 0.8em; border-radius: 5px; cursor: pointer; margin-top: 20px; transition: background-color 0.2s; }
#gameOverScreen button:hover { background-color: #1d4ed8; }
</style>
</head>
<body>
<div id="game-container">
<h1>貪吃蛇遊戲</h1>
<canvas id="gameCanvas" width="400" height="400"></canvas>
<div id="score">分數: <span id="scoreValue">0</span></div>
<div id="controls">使用方向鍵或 WASD 控制蛇</div>
</div>

<div id="gameOverScreen">
<h2>遊戲結束!</h2>
<p>最終分數: <span id="finalScore">0</span></p>
<button id="restartButton">重新開始</button>
</div>

<script>
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let speed = 7; // Initial speed (updates per second)

let snake, velocityX, velocityY, nextVelocityX, nextVelocityY, food, score, gameLoopTimeout, isGameOver;

function initGame() {
    snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
    velocityX = 0;
    velocityY = 0;
    nextVelocityX = 0; // Buffer for next move input
    nextVelocityY = 0;
    score = 0;
    isGameOver = false;
    speed = 7; // Reset speed
    scoreElement.textContent = score;
    gameOverScreen.classList.remove('visible');
    placeFood();
    clearTimeout(gameLoopTimeout); // Clear any existing loop
    gameLoop(); // Start the loop
}

function gameLoop() {
    if (isGameOver) return;

    gameLoopTimeout = setTimeout(() => {
        clearCanvas();
        moveSnake();
        if (checkCollision()) {
            endGame();
            return; // Stop loop if collision detected
        }
        drawFood();
        drawSnake();
        requestAnimationFrame(gameLoop); // Keep loop running
    }, 1000 / speed);
}

function clearCanvas() {
    ctx.fillStyle = '#111827'; // Dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    // Apply buffered velocity
    velocityX = nextVelocityX;
    velocityY = nextVelocityY;

    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    snake.unshift(head); // Add new head

    // Check if food was eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        placeFood();
        // Increase speed every 50 points (adjust as needed)
        if (score > 0 && score % 50 === 0 && speed < 15) {
            speed += 1;
             console.log("Speed increased to:", speed);
        }
    } else {
        snake.pop(); // Remove tail if no food eaten
    }
}

function checkCollision() {
    const head = snake[0];
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    // Self collision (check against body parts, excluding head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function placeFood() {
     let foodX, foodY, validPosition;
     do {
         validPosition = true;
         foodX = Math.floor(Math.random() * tileCount);
         foodY = Math.floor(Math.random() * tileCount);
         // Ensure food doesn't spawn on the snake
         for (const part of snake) {
             if (part.x === foodX && part.y === foodY) {
                 validPosition = false;
                 break;
             }
         }
     } while (!validPosition);

     food = { x: foodX, y: foodY, color: getRandomColor() };
}

function drawSnake() {
    snake.forEach((part, index) => {
         // Head color
         if (index === 0) {
             ctx.fillStyle = '#4ade80'; // Bright green head
         } else {
              // Body color (simple green)
              // const shade = Math.max(0.3, 1 - index * 0.05); // Fade tail slightly
              ctx.fillStyle = '#10b981'; // Emerald green body
         }
         ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2); // Slightly smaller rect with gap

         // Simple eye for the head
         if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = gridSize / 6;
            let eyeX = part.x * gridSize + gridSize / 2;
            let eyeY = part.y * gridSize + gridSize / 2;
            // Offset eyes based on direction
            if (velocityX === 1) eyeX += eyeSize;
            if (velocityX === -1) eyeX -= eyeSize;
            if (velocityY === 1) eyeY += eyeSize;
            if (velocityY === -1) eyeY -= eyeSize;
             ctx.beginPath();
             ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
             ctx.fill();
         }
    });
}

function drawFood() {
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);
    // Simple highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(food.x * gridSize + gridSize/4, food.y * gridSize + gridSize/4, gridSize/4, gridSize/4);
}

 function endGame() {
     isGameOver = true;
     clearTimeout(gameLoopTimeout); // Stop the game loop
     finalScoreElement.textContent = score;
     gameOverScreen.classList.add('visible');
     console.log("Game Over! Score:", score);
 }

function getRandomColor() {
    const colors = ['#f87171', '#fb923c', '#facc15', '#a78bfa', '#f472b6', '#60a5fa'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Keyboard Input Handler
function handleKeyDown(e) {
     if (isGameOver) return; // Ignore input if game over

     let requestedVX = 0;
     let requestedVY = 0;

     switch (e.key.toLowerCase()) {
         case 'arrowup': case 'w':
             if (velocityY === 0) requestedVY = -1; // Prevent moving directly opposite
             break;
         case 'arrowdown': case 's':
              if (velocityY === 0) requestedVY = 1;
             break;
         case 'arrowleft': case 'a':
              if (velocityX === 0) requestedVX = -1;
             break;
         case 'arrowright': case 'd':
              if (velocityX === 0) requestedVX = 1;
             break;
         default:
             return; // Ignore other keys
     }

     // Buffer the next move if valid input
     if (requestedVX !== 0 || requestedVY !== 0) {
         nextVelocityX = requestedVX;
         nextVelocityY = requestedVY;
     }
}

// Event Listeners
document.addEventListener('keydown', handleKeyDown);
restartButton.addEventListener('click', initGame);

// Initial game start
initGame();
<\/script> // Escaped closing script tag for safety in template literal
</body>
</html>`;

         // Simulate API latency and step progression
         let currentSimulatedStep = 0;
         const stepDelay = 500; // milliseconds per step

         const stepInterval = setInterval(() => {
             currentSimulatedStep++;
             if (currentSimulatedStep < processSteps.length) {
                 showProcessStep(currentSimulatedStep);
             } else {
                 clearInterval(stepInterval); // Stop simulation steps
                 completeGeneration(sampleCode); // Complete with the result
             }
         }, stepDelay);
     }


    // Complete Generation Process
    function completeGeneration(resultCode) {
        if (!resultCode) {
            showError("生成失敗，未收到代碼。");
            return;
        }
        // Update code display
        generatedCodeElement.textContent = resultCode;

        // Store generated content in state
        state.generatedContent = resultCode;
        state.codeGenerated = true; // Mark that code exists

        // Update preview immediately if that tab is active
        if (!previewTab.classList.contains('hidden')) {
            updatePreview();
        } else {
            // Optionally switch to preview tab automatically?
            // switchTab('preview');
        }

        // Finalize UI state
        setGeneratingState(false); // Re-enable button
        showAllProcessSteps(); // Mark all steps visually complete
        console.log("Generation complete.");
    }

    // Initialize the application
    init();
});
