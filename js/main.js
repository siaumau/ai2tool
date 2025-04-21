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
        generatedContent: null,
        isPreviewExpanded: false
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
        previewTabBtn.addEventListener('click', toggleFullPreview);

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
                promptText = '創建一個簡單的貪吃蛇遊戲，UI要專業，且要有計分功能與重玩按鈕，使用HTML5 Canvas。蛇應該能夠通過鍵盤操控，吃到食物後會變長，碰到牆壁或自己會結束遊戲。';
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
        // 如果已經解析出 HTML 區塊，建立新的預覽文件
        if (state.generatedHTML) {
            const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow?.document;
            if (previewDoc) {
                previewDoc.documentElement.innerHTML = `
                    <!DOCTYPE html>
                    <html lang="zh-TW">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        ${state.generatedCSS ? `<style>${state.generatedCSS}</style>` : ''}
                    </head>
                    <body>
                        ${state.generatedHTML}
                        ${state.generatedJS ? `<script>${state.generatedJS}</script>` : ''}
                    </body>
                    </html>
                `;
            }
            return;
        }
        if (state.generatedContent && previewFrame) {
            try {
                const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow?.document;
                if (previewDoc) {
                    // 轉換外部資源路徑
                    let cleanContent = state.generatedContent;
                    cleanContent = cleanContent
                        .replace(/href="style\.css"/g, 'href="css/main.css"')
                        .replace(/href="styles\.css"/g, 'href="css/main.css"')
                        .replace(/src="script\.js"/g, 'src="js/main.js"');
                    // 解析 HTML 內容中的 script 和其他元素
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = cleanContent;

                    // 分別收集 scripts、styles 和其他 HTML 內容
                    const scripts = Array.from(tempDiv.getElementsByTagName('script'));
                    const styles = Array.from(tempDiv.getElementsByTagName('style'));
                    const links = Array.from(tempDiv.getElementsByTagName('link'));

                    // 移除所有 script 和 style 標籤，只留下其他 HTML
                    scripts.forEach(script => script.remove());
                    styles.forEach(style => style.remove());
                    links.forEach(link => link.remove());

                    // 設置基本的 HTML 結構並添加 Chart.js CDN
                    const baseHref = window.location.href;
                    previewDoc.documentElement.innerHTML = `
                        <html>
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <base href="${baseHref}" target="_blank">
                                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                            </head>
                            <body></body>
                        </html>
                    `;

                    // 先添加 styles
                    styles.forEach(style => {
                        previewDoc.head.appendChild(previewDoc.importNode(style, true));
                    });

                    // 添加 link 標籤
                    links.forEach(link => {
                        previewDoc.head.appendChild(previewDoc.importNode(link, true));
                    });

                    // 添加主要的 HTML 內容
                    previewDoc.body.innerHTML = tempDiv.innerHTML;

                    // 建立一個 Promise 數組來追踪所有外部腳本的加載
                    const scriptLoadPromises = [];

                    // 最後添加並執行 scripts
                    scripts.forEach(script => {
                        const newScript = previewDoc.createElement('script');
                        if (script.src) {
                            // 如果是外部腳本，創建一個加載 Promise
                            const loadPromise = new Promise((resolve, reject) => {
                                newScript.onload = resolve;
                                newScript.onerror = reject;
                            });
                            scriptLoadPromises.push(loadPromise);
                            newScript.src = script.src;
                        } else {
                            // 如果是內聯腳本，包裝在一個立即解析的 Promise 中
                            newScript.textContent = script.textContent;
                            scriptLoadPromises.push(Promise.resolve());
                        }
                        previewDoc.body.appendChild(newScript);
                    });

                    // 等待所有腳本加載完成
                    Promise.all(scriptLoadPromises)
                        .catch(error => {
                            console.error('Error loading scripts:', error);
                        });

                } else {
                    console.error("Could not access preview iframe document.");
                }
            } catch (error) {
                console.error("Error updating preview iframe:", error);
                const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow?.document;
                if (previewDoc) {
                    previewDoc.documentElement.innerHTML = `
                        <html>
                            <head>
                                <meta charset="UTF-8">
                            </head>
                            <body>
                                <h1>Preview Error</h1>
                                <p>${error.message}</p>
                            </body>
                        </html>
                    `;
                }
            }
        } else if (!state.generatedContent) {
            // Clear preview if no content
            const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow?.document;
            if (previewDoc) {
                previewDoc.documentElement.innerHTML = `
                    <html>
                        <head>
                            <meta charset="UTF-8">
                        </head>
                        <body></body>
                    </html>
                `;
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

    // Function to make a real API request for code generation
    async function generateCodeFromAPI(prompt) {
        try {
            console.log('Sending request with prompt:', prompt);

            // 更新 UI 以顯示生成進度
            generatedCodeElement.textContent = '';

            const response = await fetch('http://localhost:3101/proxy/generate-code', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.apiKey}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    model: state.selectedModel
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Received response:', data);

            if (!data.generatedCode) {
                throw new Error('No code generated in response');
            }

            return data.generatedCode;
        } catch (error) {
            console.error('Error generating code:', error);
            showError(`生成失敗: ${error.message}`);
            return null;
        }
    }

    // Handle Form Submission (Generation Request)
    async function handleSubmit(e) {
        e.preventDefault(); // Prevent default form submission
        state.prompt = promptInput.value.trim(); // Update state from active input

        if (!state.prompt) {
            showError('請輸入需求描述');
            promptInput.focus();
            return;
        }

        if (!state.apiKey) {
            showError('請在設置中輸入 OpenRouter API 金鑰');
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

        try {
            const generatedCode = await generateCodeFromAPI(state.prompt);
            if (generatedCode) {
                completeGeneration(generatedCode);
            } else {
                showError('生成失敗，未收到代碼。');
            }
        } finally {
            setGeneratingState(false); // Re-enable button
        }
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

    // 新增函數：解析 Markdown code fences 中的 HTML、CSS、JS 區塊
    function parseGeneratedContent(raw) {
        const htmlMatch = raw.match(/```html\s*([\s\S]*?)```/i);
        const cssMatch = raw.match(/```css\s*([\s\S]*?)```/i);
        const jsMatch = raw.match(/```(?:javascript|js)\s*([\s\S]*?)```/i);
        return {
            html: htmlMatch ? htmlMatch[1].trim() : '',
            css: cssMatch ? cssMatch[1].trim() : '',
            js: jsMatch ? jsMatch[1].trim() : ''
        };
    }

    // Complete Generation Process
    function completeGeneration(resultCode) {
        if (!resultCode) {
            showError("生成失敗，未收到代碼。");
            return;
        }
        // 解析並拆分 HTML, CSS, JS 區塊
        const parsed = parseGeneratedContent(resultCode);
        state.generatedHTML = parsed.html;
        state.generatedCSS = parsed.css;
        state.generatedJS = parsed.js;

        // 更新 Code 顯示：預設顯示 HTML 區塊
        generatedCodeElement.textContent = state.generatedHTML || resultCode;

        // 保存原始生成內容
        state.generatedContent = resultCode;
        state.codeGenerated = true;

        // 儲存檔案至伺服器
        fetch('http://localhost:3101/proxy/save-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html: state.generatedHTML,
                css: state.generatedCSS,
                js: state.generatedJS
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log('檔案已儲存至伺服器');
            } else {
                console.error('存檔失敗:', data.error);
            }
        })
        .catch(err => {
            console.error('儲存檔案時發生錯誤:', err);
        });

        // 更新預覽（若為預覽 tab）
        if (!previewTab.classList.contains('hidden')) {
            updatePreview();
        }

        // 最後設定 UI 狀態
        setGeneratingState(false);
        showAllProcessSteps();
        console.log("Generation complete.");
    }

    // 切換預覽面板寬度（展開/還原）
    function toggleFullPreview() {
        // 切換到預覽分頁
        switchTab('preview');
        // 僅在生成後可展開/還原
        if (!state.codeGenerated) return;
        const leftArea = twoColumnLayout.children[0];
        const rightArea = twoColumnLayout.children[1];
        if (!state.isPreviewExpanded) {
            // 隱藏左側，擴展右側至整行
            leftArea.style.display = 'none';
            rightArea.classList.remove('lg:col-span-2');
            rightArea.classList.add('lg:col-span-5');
        } else {
            // 還原左側顯示與右側寬度
            leftArea.style.display = '';
            rightArea.classList.remove('lg:col-span-5');
            rightArea.classList.add('lg:col-span-2');
        }
        state.isPreviewExpanded = !state.isPreviewExpanded;
    }

    // Initialize the application
    init();
});
