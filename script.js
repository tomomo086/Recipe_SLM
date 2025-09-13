// 固定のAPI設定
const API_CONFIG = {
    url: 'http://192.168.2.107:1234',
    model: 'local-model' // デフォルトモデル名
};

// レシピデータ（外部JSONファイルから読み込み）
// 新しいレシピの追加方法: data/recipes.json を編集してください
let RECIPE_DATA = [];

// レシピデータを読み込む関数
async function loadRecipeData() {
    try {
        console.log('📖 レシピデータ読み込み開始...');
        const response = await fetch('data/recipes.json');
        if (!response.ok) {
            throw new Error(`レシピファイルの読み込みに失敗: ${response.status}`);
        }
        const recipes = await response.json();
        RECIPE_DATA = recipes;
        console.log(`✅ レシピデータ読み込み完了: ${RECIPE_DATA.length}件のレシピ`);
        showStatus(`✓ ${RECIPE_DATA.length}件のレシピを読み込みました`);
    } catch (error) {
        console.error('❌ レシピデータ読み込みエラー:', error);
        showStatus('⚠️ レシピデータの読み込みに失敗しました', true);
        // フォールバック: 空配列のまま継続
        RECIPE_DATA = [];
    }
}

// Function Tools定義
const FUNCTION_TOOLS = [
    {
        type: "function",
        function: {
            name: "search_recipes",
            description: "材料やキーワードでレシピを検索します",
            parameters: {
                type: "object",
                properties: {
                    keyword: {
                        type: "string",
                        description: "検索するキーワード（料理名、材料名など）"
                    },
                    ingredients: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        description: "使いたい材料のリスト"
                    },
                    category: {
                        type: "string",
                        description: "料理カテゴリ（teiban, yasai, friedなど）"
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_recipe_detail",
            description: "レシピIDから詳細なレシピ情報を取得します",
            parameters: {
                type: "object",
                properties: {
                    recipe_id: {
                        type: "string",
                        description: "レシピのID（例: recipe_001）"
                    }
                },
                required: ["recipe_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_user_favorites",
            description: "ユーザーのお気に入りレシピ（いつものレシピ）を取得します",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    }
];

// ローカルFunction実行
function executeLocalFunction(functionName, parameters) {
    console.log(`⚙️ ローカル関数「${functionName}」実行中...`, parameters);
    
    switch (functionName) {
        case 'search_recipes':
            return searchRecipes(parameters);
        case 'get_recipe_detail':
            return getRecipeDetail(parameters);
        case 'get_user_favorites':
            return getUserFavorites(parameters);
        default:
            return { error: true, message: `未知の関数: ${functionName}` };
    }
}

function searchRecipes(parameters) {
    const { keyword = '', ingredients = [], category = null } = parameters;
    
    const results = RECIPE_DATA.map(recipe => {
        let score = 0;
        const searchText = keyword ? keyword.toLowerCase() : '';
        
        // キーワードを単語に分割（スペース、全角スペース区切り）
        const searchWords = searchText.split(/[\s　]+/).filter(word => word.length > 0);
        
        console.log(`🔍 検索ワード: "${keyword}" → [${searchWords.join(', ')}]`);
        console.log(`📝 レシピタイトル: "${recipe.title}"`);

        // 料理名マッチング: 各単語について+20点
        if (searchWords.length > 0) {
            const titleLower = recipe.title.toLowerCase();
            const matchedWords = searchWords.filter(word => titleLower.includes(word));
            score += matchedWords.length * 20;
            console.log(`📊 タイトルマッチ: ${matchedWords.length}個 (${matchedWords.join(', ')}) → +${matchedWords.length * 20}点`);
        }

        // 完全なキーワードマッチングも試す（従来の方式）
        if (searchText && recipe.title.toLowerCase().includes(searchText)) {
            score += 10; // ボーナス点
            console.log(`🎯 完全マッチ: "${searchText}" → +10点`);
        }

        // エイリアス（別名）マッチング: +25点×個数
        if (searchWords.length > 0 && recipe.aliases) {
            searchWords.forEach(word => {
                const aliasMatches = recipe.aliases.filter(alias => 
                    alias.toLowerCase().includes(word)
                );
                if (aliasMatches.length > 0) {
                    score += aliasMatches.length * 25;
                    console.log(`🏷️ エイリアスマッチ: ${aliasMatches.length}個 (${aliasMatches.join(', ')}) → +${aliasMatches.length * 25}点`);
                }
            });
        }

        // 材料マッチング: +10点×個数
        if (ingredients.length > 0) {
            const matchedIngredients = ingredients.filter(ing => 
                recipe.ingredients.some(recipeIng => 
                    recipeIng.toLowerCase().includes(ing.toLowerCase())
                )
            );
            if (matchedIngredients.length > 0) {
                score += matchedIngredients.length * 10;
                console.log(`🥬 材料マッチ: ${matchedIngredients.length}個 → +${matchedIngredients.length * 10}点`);
            }
        }

        // 特徴マッチング: +5点×個数
        if (searchWords.length > 0 && recipe.features) {
            searchWords.forEach(word => {
                const featureMatches = recipe.features.filter(feature => 
                    feature.toLowerCase().includes(word)
                );
                if (featureMatches.length > 0) {
                    score += featureMatches.length * 5;
                    console.log(`✨ 特徴マッチ: ${featureMatches.length}個 → +${featureMatches.length * 5}点`);
                }
            });
        }

        // メイン材料マッチング: 各単語について+15点
        if (searchWords.length > 0) {
            let mainScore = 0;
            searchWords.forEach(word => {
                const mainMatches = recipe.main_ingredients.filter(main => 
                    main.toLowerCase().includes(word)
                );
                mainScore += mainMatches.length * 15;
            });
            score += mainScore;
            if (mainScore > 0) {
                console.log(`🍆 メイン材料マッチ: +${mainScore}点`);
            }
        }

        // カテゴリマッチング: +10点
        if (category && recipe.categories.includes(category)) {
            score += 10;
            console.log(`📂 カテゴリマッチ: "${category}" → +10点`);
        }

        return { ...recipe, score };
    });

    const sortedResults = results
        .filter(recipe => recipe.score > 0)
        .sort((a, b) => b.score - a.score);
    
    console.log(`📈 検索結果: ${sortedResults.length}件`);
    sortedResults.forEach((recipe, index) => {
        console.log(`${index + 1}. "${recipe.title}" (スコア: ${recipe.score})`);
    });

    return {
        success: true,
        count: sortedResults.length,
        recipes: sortedResults.slice(0, 10)
    };
}

function getRecipeDetail(parameters) {
    const { recipe_id } = parameters;
    const recipe = RECIPE_DATA.find(r => r.id === recipe_id);
    
    if (recipe) {
        return { success: true, recipe: recipe };
    } else {
        return { success: false, message: `レシピID "${recipe_id}" が見つかりません` };
    }
}

function getUserFavorites(parameters) {
    const favorites = RECIPE_DATA.filter(recipe => 
        recipe.categories.includes('teiban')
    );
    
    return {
        success: true,
        count: favorites.length,
        recipes: favorites
    };
}

// ツール実行状況を表示する関数
function addFunctionCallingStatus(functionCalls) {
    console.log('🏗️ addFunctionCallingStatus開始:', functionCalls);
    const statusDiv = document.createElement('div');
    statusDiv.className = 'function-calling-status';
    console.log('📦 statusDiv作成完了:', statusDiv);
    
    const header = document.createElement('div');
    header.innerHTML = `🔧 <strong>Function Calling実行中...</strong> (${functionCalls.length}個の関数)`;
    statusDiv.appendChild(header);
    console.log('📋 header追加完了');
    
    functionCalls.forEach((call, index) => {
        const callItem = document.createElement('div');
        callItem.className = 'function-call-item';
        
        const params = JSON.parse(call.function.arguments);
        const paramStr = Object.keys(params).map(key => 
            `${key}: "${params[key]}"`
        ).join(', ');
        
        callItem.innerHTML = `
            <span class="icon">⚙️</span>
            <span class="function-name">${call.function.name}</span>
            <span class="function-params">(${paramStr})</span>
        `;
        
        statusDiv.appendChild(callItem);
        console.log(`⚙️ callItem ${index + 1} 追加完了:`, call.function.name);
    });
    
    const messagesDiv = document.getElementById('messages');
    console.log('📱 messagesDiv取得:', messagesDiv ? 'あり' : 'なし');
    messagesDiv.appendChild(statusDiv);
    messagesDiv.scrollTop = 999999;
    console.log('✅ statusDiv DOM追加完了');
    return statusDiv;
}

// ツール実行結果を表示する関数
function updateFunctionCallingStatus(statusDiv, results) {
    console.log('🔄 updateFunctionCallingStatus開始:', statusDiv, results);
    const resultSummary = document.createElement('div');
    resultSummary.className = 'function-result-summary';
    console.log('📦 resultSummary作成完了');
    
    const totalResults = results.reduce((sum, result) => {
        const parsed = JSON.parse(result.content);
        console.log('📊 parsed result:', parsed);
        return sum + (parsed.count || 0);
    }, 0);
    
    console.log('🔢 totalResults:', totalResults);
    resultSummary.innerHTML = `✅ <strong>実行完了</strong> - ${totalResults}件のレシピデータを取得`;
    statusDiv.appendChild(resultSummary);
    console.log('✅ resultSummary DOM追加完了');
}

function addMessage(text, isUser, useTypingEffect = false) {
    const div = document.createElement('div');
    div.className = 'message ' + (isUser ? 'user' : 'ai');
    
    // デバッグ用ログ
    console.log('addMessage called:', { text: text.substring(0, 50), isUser, useTypingEffect });
    
    // AIメッセージに詳細表示ボタンを追加（ウェルカムメッセージ以外）
    if (!isUser) {
        // ウェルカムメッセージかどうかをテキスト内容で判定
        const isWelcomeMessage = text.includes('ポケット献立アシスタントへようこそ');
        
        console.log('AI message detected, isWelcomeMessage:', isWelcomeMessage);
        
        if (!isWelcomeMessage) {
            // メッセージコンテナを作成
            const messageContainer = document.createElement('div');
            messageContainer.className = 'message-container';
            
            // メッセージテキスト部分
            const messageText = document.createElement('div');
            messageText.className = 'message-text';
            
            // 詳細表示ボタン
            const detailButton = document.createElement('button');
            detailButton.className = 'detail-btn';
            detailButton.innerHTML = '📖';
            detailButton.title = '詳細表示';
            detailButton.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('Detail button clicked');
                showMessageModal(text);
            });
            
            console.log('Button created and added');
            
            // 要素を組み合わせ
            messageContainer.appendChild(messageText);
            messageContainer.appendChild(detailButton);
            div.appendChild(messageContainer);
            
            // DOMに追加してからタイピング効果を開始
            document.getElementById('messages').appendChild(div);
            document.getElementById('messages').scrollTop = 999999;
            
            // タイピング効果を適用
            if (useTypingEffect) {
                console.log('🎬 タイピング効果開始:', text.substring(0, 30));
                typewriteText(messageText, text);
            } else {
                messageText.textContent = text;
            }
            
            return; // 早期リターンで重複追加を防ぐ
        } else {
            // ウェルカムメッセージは従来通り
            div.textContent = text;
            div.classList.add('welcome-message');
        }
    } else {
        // ユーザーメッセージは従来通り
        div.textContent = text;
    }
    
    document.getElementById('messages').appendChild(div);
    document.getElementById('messages').scrollTop = 999999;
}

function showStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'status ' + (isError ? 'error' : 'success');
    statusDiv.textContent = message;
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, true);
    input.value = '';
    sendBtn.disabled = true;
    sendBtn.textContent = '送信中...';

    try {
        // AIの応答用のメッセージ要素を作成
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai';
        aiMessageDiv.textContent = '';
        document.getElementById('messages').appendChild(aiMessageDiv);
        document.getElementById('messages').scrollTop = 999999;

        const response = await fetch(API_CONFIG.url + '/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    {
                        role: "system",
                        content: `あなたは「ポケット献立アシスタント」です。料理に関する質問に親しみやすく答える専門アシスタントです。

利用可能な関数:
- search_recipes: 材料やキーワードでレシピを検索
- get_recipe_detail: レシピIDから詳細情報を取得  
- get_user_favorites: お気に入り（定番）レシピを取得

【重要】ユーザーが以下のような質問をした場合は、必ずsearch_recipes関数を実行してください：
- 「○○の作り方教えて」「○○のレシピ教えて」
- 「○○を使った料理教えて」「○○の料理ある？」
- 「○○料理教えて」「○○のメニュー教えて」
- 材料名や料理名が含まれる質問全般

例: 「なすを使った料理教えて」→ search_recipes(keyword: "なす")`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                tools: FUNCTION_TOOLS,
                tool_choice: "auto",
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📨 LM Studio応答データ:', data);
        console.log('📨 message:', data.choices[0].message);
        console.log('📨 tool_calls存在チェック:', data.choices[0].message.tool_calls);
        
        // Function Calling処理
        console.log('🔍 Function Calling条件チェック開始...');
        if (data.choices[0].message.tool_calls && data.choices[0].message.tool_calls.length > 0) {
            console.log('✅ Function Calling検出:', data.choices[0].message.tool_calls.length, '個');
            console.log('Tool calls:', data.choices[0].message.tool_calls);
            
            // リアルタイム表示を追加
            console.log('🗑️ aiMessageDiv削除実行...');
            aiMessageDiv.remove();
            console.log('🎯 リアルタイム表示開始...');
            console.log('📋 addFunctionCallingStatus関数チェック:', typeof addFunctionCallingStatus);
            const statusDiv = addFunctionCallingStatus(data.choices[0].message.tool_calls);
            console.log('📺 ステータス表示作成完了:', statusDiv);
            console.log('📺 ステータス表示要素の親:', statusDiv ? statusDiv.parentNode : 'なし');
            console.log('📺 ステータス表示の内容:', statusDiv ? statusDiv.innerHTML : 'なし');
            
            const toolResults = [];
            
            // ローカルでFunction実行
            for (const toolCall of data.choices[0].message.tool_calls) {
                const functionName = toolCall.function.name;
                const parameters = JSON.parse(toolCall.function.arguments);
                
                console.log(`⚙️ 関数「${functionName}」実行中...`, parameters);
                
                const result = executeLocalFunction(functionName, parameters);
                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    content: JSON.stringify(result, null, 2)
                });
            }
            
            // 関数実行結果を含めて最終応答を取得
            const finalResponse = await fetch(API_CONFIG.url + '/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: API_CONFIG.model,
                    messages: [
                        {
                            role: "system", 
                            content: `あなたは「ポケット献立アシスタント」です。料理に関する質問に親しみやすく答える専門アシスタントです。

関数実行結果を基に、詳しく親しみやすい説明を提供してください。レシピの特徴、調理のコツ、材料の代替案なども含めて説明すると喜ばれます。`
                        },
                        {
                            role: "user",
                            content: message
                        },
                        data.choices[0].message,
                        ...toolResults
                    ],
                    temperature: 0.7,
                    stream: false
                })
            });
            
            const finalData = await finalResponse.json();
            
            // 実行完了表示
            setTimeout(() => {
                console.log('⏰ updateFunctionCallingStatus実行開始...');
                console.log('📊 toolResults:', toolResults);
                const mockResults = toolResults.map(result => ({
                    content: result.content
                }));
                console.log('🎭 mockResults:', mockResults);
                console.log('📋 updateFunctionCallingStatus関数チェック:', typeof updateFunctionCallingStatus);
                console.log('📋 statusDiv存在チェック:', statusDiv ? 'あり' : 'なし');
                updateFunctionCallingStatus(statusDiv, mockResults);
                console.log('✅ updateFunctionCallingStatus実行完了');
            }, 200);
            
            // 最終応答を表示（タイピング効果付き）
            setTimeout(() => {
                console.log('🎬 最終応答をタイピング効果で表示開始');
                addMessage(finalData.choices[0].message.content, false, true);
            }, 300);
            
        } else {
            // 通常の応答（タイピング効果付き）
            console.log('💬 通常の応答モード (Function Calling無し)');
            aiMessageDiv.remove();
            addMessage(data.choices[0].message.content, false, true);
        }

        showStatus('✓ 応答完了');

    } catch (error) {
        addMessage('エラー: ' + error.message, false);
        showStatus('送信エラー: ' + error.message, true);
    } finally {
        // 必ずボタンの状態を復元
        sendBtn.disabled = false;
        sendBtn.textContent = '送信';
    }
}

function clearChat() {
    const messagesDiv = document.getElementById('messages');
    // ウェルカムメッセージを除くすべてのメッセージを削除
    const welcomeMessage = messagesDiv.querySelector('.welcome-message');
    messagesDiv.innerHTML = '';
    if (welcomeMessage) {
        messagesDiv.appendChild(welcomeMessage);
    }
    showStatus('✓ チャット履歴をクリアしました');
}

// スマホでの使いやすさを向上させる機能
function optimizeForMobile() {
    // タッチ操作の最適化
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // スマホで入力フィールドにフォーカスした時に自動スクロール
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });

    document.addEventListener('contextmenu', function(event) {
        // テキストが選択されている場合はコンテキストメニューを許可
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            return; // メニューを表示させる
        }
        
        // 入力フィールド内でのコンテキストメニューは許可
        const target = event.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            return; // メニューを表示させる
        }
        
        // その他の場合は無効化（画像の長押しメニュー等を防ぐ）
        event.preventDefault();
    });
    
    // スワイプでチャット履歴をクリア
    let startX = 0;
    let startY = 0;
    let isSwiping = false;
    
    // 統合されたtouchstartリスナー - 2本指ズーム防止とスワイプ開始を同時処理
    document.addEventListener('touchstart', function(event) {
        // 2本指ズームのみ防止（3本指以上のシステム操作は許可）
        if (event.touches.length === 2) {
            event.preventDefault();
            return;
        }
        
        // 3本指以上の場合はシステム操作を優先（スクリーンショット等）
        if (event.touches.length > 2) {
            return; // preventDefault()を呼ばずにシステムに処理を委ねる
        }
        
        // シングルタッチの場合のスワイプ開始処理
        if (event.touches.length === 1) {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            isSwiping = false;
        }
    }, { passive: false }); // 2本指ズーム防止のためpassive: falseが必要
    
    document.addEventListener('touchmove', function(event) {
        if (!isSwiping && event.touches.length === 1) {
            const deltaX = Math.abs(event.touches[0].clientX - startX);
            const deltaY = Math.abs(event.touches[0].clientY - startY);
            
            if (deltaX > 50 && deltaY < 30) {
                isSwiping = true;
            }
        }
    });
    
    document.addEventListener('touchend', function(event) {
        if (isSwiping && event.changedTouches.length === 1) {
            const deltaX = event.changedTouches[0].clientX - startX;
            if (deltaX > 100) {
                // 右スワイプでチャット履歴をクリア
                if (confirm('チャット履歴をクリアしますか？')) {
                    clearChat();
                }
            }
        }
    });
}

// AIメッセージのタイピング効果
function typewriteText(element, text, speed = 15) {
    return new Promise((resolve) => {
        let index = 0;
        element.textContent = '';
        
        function typeNextChar() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeNextChar, speed);
            } else {
                resolve();
            }
        }
        
        typeNextChar();
    });
}

// タイピングアニメーション機能
function startTypingAnimation() {
    const input = document.getElementById('userInput');
    const placeholders = JSON.parse(input.getAttribute('data-placeholders'));
    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    
    function typeText() {
        const currentPlaceholder = placeholders[currentIndex];
        
        if (isDeleting) {
            // 文字を削除
            currentText = currentPlaceholder.substring(0, currentText.length - 1);
        } else {
            // 文字を追加
            currentText = currentPlaceholder.substring(0, currentText.length + 1);
        }
        
        // プレースホルダーを更新
        input.setAttribute('placeholder', currentText);
        
        let typeSpeed = isDeleting ? 50 : 100; // 削除の方が速い
        
        if (!isDeleting && currentText === currentPlaceholder) {
            // 完全に表示されたら、少し待ってから削除開始
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            // 完全に削除されたら、次のメッセージへ
            isDeleting = false;
            currentIndex = (currentIndex + 1) % placeholders.length;
            typeSpeed = 500;
        }
        
        setTimeout(typeText, typeSpeed);
    }
    
    // アニメーション開始
    typeText();
}

// メッセージモーダル表示機能
function showMessageModal(messageText) {
    const modal = document.getElementById('messageModal');
    const modalContent = document.getElementById('modalMessageContent');
    
    modalContent.textContent = messageText;
    modal.style.display = 'flex';
    
    // bodyのスクロールを無効化
    document.body.style.overflow = 'hidden';
}

function hideMessageModal() {
    const modal = document.getElementById('messageModal');
    modal.style.display = 'none';
    
    // bodyのスクロールを有効化
    document.body.style.overflow = '';
}

// 初期化
document.addEventListener('DOMContentLoaded', async function() {
    // レシピデータを読み込み
    await loadRecipeData();
    
    // スマホ最適化を適用
    optimizeForMobile();
    
    // タイピングアニメーション開始
    startTypingAnimation();
    
    // モーダル機能の初期化
    const modal = document.getElementById('messageModal');
    const closeBtn = document.getElementById('closeModal');
    
    // 閉じるボタンのクリックイベント
    closeBtn.addEventListener('click', hideMessageModal);
    
    // モーダル背景クリックで閉じる
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideMessageModal();
        }
    });
    
    // ESCキーで閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            hideMessageModal();
        }
    });
    
    // 起動メッセージを表示
    showStatus('✓ ポケット献立アシスタントが起動しました');
});
