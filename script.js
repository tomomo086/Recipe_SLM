// 固定のAPI設定
const API_CONFIG = {
    url: 'http://192.168.2.107:1234',
    model: 'local-model' // デフォルトモデル名
};

// レシピデータ（ローカル）
const RECIPE_DATA = [
    {
        "id": "recipe_001",
        "title": "豚のしょうが焼き",
        "cooking_time": 15,
        "ingredients": [
            "豚ロース薄切り肉 300g",
            "生姜 1片",
            "醤油 大さじ2",
            "みりん 大さじ2",
            "酒 大さじ1",
            "砂糖 小さじ1",
            "サラダ油 大さじ1",
            "玉ねぎ 1/2個"
        ],
        "steps": [
            "生姜をすりおろし、調味料と混ぜてタレを作る",
            "豚肉を一口大に切り、タレに10分漬け込む",
            "玉ねぎを薄切りにする",
            "フライパンに油を熱し、豚肉を焼く",
            "豚肉に火が通ったら玉ねぎを加えて炒める",
            "タレを加えて絡めて完成"
        ],
        "main_ingredients": ["豚肉", "生姜"],
        "categories": ["teiban"]
    },
    {
        "id": "recipe_002",
        "title": "なすの照り焼き",
        "cooking_time": 20,
        "ingredients": [
            "なす 3本",
            "醤油 大さじ3",
            "みりん 大さじ3",
            "砂糖 大さじ1",
            "サラダ油 大さじ2",
            "白ごま 小さじ1"
        ],
        "steps": [
            "なすを乱切りにして水にさらす",
            "醤油、みりん、砂糖を混ぜてタレを作る",
            "フライパンに多めの油を熱する",
            "なすを入れて中火で焼く",
            "なすがしんなりしたらタレを加える",
            "タレが絡んだら白ごまをふって完成"
        ],
        "main_ingredients": ["なす"],
        "categories": ["yasai", "teiban"]
    },
    {
        "id": "recipe_003",
        "title": "鶏の唐揚げ",
        "cooking_time": 25,
        "ingredients": [
            "鶏もも肉 400g",
            "醤油 大さじ2",
            "酒 大さじ1",
            "にんにく 1片",
            "生姜 1片",
            "片栗粉 大さじ4",
            "薄力粉 大さじ2",
            "揚げ油 適量"
        ],
        "steps": [
            "鶏肉を一口大に切る",
            "にんにく、生姜をすりおろす",
            "鶏肉に醤油、酒、にんにく、生姜を揉み込み30分漬ける",
            "片栗粉と薄力粉を混ぜて鶏肉にまぶす",
            "170度の油で3-4分揚げる",
            "一度取り出し、180度で1分再度揚げて完成"
        ],
        "main_ingredients": ["鶏肉"],
        "categories": ["teiban", "fried"]
    }
];

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

        // 料理名マッチング: +20点
        if (searchText && recipe.title.toLowerCase().includes(searchText)) {
            score += 20;
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
            }
        }

        // メイン材料マッチング: +15点
        if (searchText) {
            const mainMatches = recipe.main_ingredients.filter(main => 
                main.toLowerCase().includes(searchText)
            );
            if (mainMatches.length > 0) {
                score += 15 * mainMatches.length;
            }
        }

        // カテゴリマッチング: +10点
        if (category && recipe.categories.includes(category)) {
            score += 10;
        }

        return { ...recipe, score };
    });

    const sortedResults = results
        .filter(recipe => recipe.score > 0)
        .sort((a, b) => b.score - a.score);

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
    const statusDiv = document.createElement('div');
    statusDiv.className = 'function-calling-status';
    
    const header = document.createElement('div');
    header.innerHTML = `🔧 <strong>Function Calling実行中...</strong> (${functionCalls.length}個の関数)`;
    statusDiv.appendChild(header);
    
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
    });
    
    document.getElementById('messages').appendChild(statusDiv);
    document.getElementById('messages').scrollTop = 999999;
    return statusDiv;
}

// ツール実行結果を表示する関数
function updateFunctionCallingStatus(statusDiv, results) {
    const resultSummary = document.createElement('div');
    resultSummary.className = 'function-result-summary';
    
    const totalResults = results.reduce((sum, result) => {
        const parsed = JSON.parse(result.content);
        return sum + (parsed.count || 0);
    }, 0);
    
    resultSummary.innerHTML = `✅ <strong>実行完了</strong> - ${totalResults}件のレシピデータを取得`;
    statusDiv.appendChild(resultSummary);
}

function addMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = 'message ' + (isUser ? 'user' : 'ai');
    
    // デバッグ用ログ
    console.log('addMessage called:', { text: text.substring(0, 50), isUser });
    
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
            messageText.textContent = text;
            
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

ユーザーが料理や材料について質問したら、必ず適切な関数を実行してください。`
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
        
        // Function Calling処理
        if (data.choices[0].message.tool_calls && data.choices[0].message.tool_calls.length > 0) {
            console.log('🔧 Function Calling検出:', data.choices[0].message.tool_calls.length, '個');
            console.log('Tool calls:', data.choices[0].message.tool_calls);
            
            // リアルタイム表示を追加
            aiMessageDiv.remove();
            console.log('🎯 リアルタイム表示開始...');
            const statusDiv = addFunctionCallingStatus(data.choices[0].message.tool_calls);
            console.log('📺 ステータス表示作成完了:', statusDiv);
            
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
                            content: `あなたは「ポケット献立アシスタント」です。料理に関する質問に親しみやすく答える専門アシスタントです。関数実行結果を基に、詳しく親しみやすい説明を提供してください。`
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
                const mockResults = toolResults.map(result => ({
                    content: result.content
                }));
                updateFunctionCallingStatus(statusDiv, mockResults);
            }, 500);
            
            // 最終応答を表示
            setTimeout(() => {
                addMessage(finalData.choices[0].message.content, false);
            }, 1000);
            
        } else {
            // 通常の応答
            aiMessageDiv.remove();
            addMessage(data.choices[0].message.content, false);
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
document.addEventListener('DOMContentLoaded', function() {
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
