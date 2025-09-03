// モデル一覧を取得する関数
async function loadModels() {
    const loadBtn = document.getElementById('loadModelsBtn');
    const apiUrl = document.getElementById('apiUrl').value;
    const modelSelect = document.getElementById('modelSelect');
    
    loadBtn.disabled = true;
    loadBtn.textContent = '取得中...';
    
    try {
        // LM Studioのモデル一覧APIを呼び出し
        const response = await fetch(apiUrl + '/v1/models', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // 既存のオプションをクリア（最初のオプションは残す）
            while (modelSelect.children.length > 1) {
                modelSelect.removeChild(modelSelect.lastChild);
            }
            
            // モデル一覧をドロップダウンに追加
            if (data.data && data.data.length > 0) {
                data.data.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id;
                    option.textContent = model.id;
                    modelSelect.appendChild(option);
                });
                
                // 最初のモデルを選択して固定
                if (modelSelect.children.length > 1) {
                    modelSelect.selectedIndex = 1;
                    // 選択後、セレクトボックスを無効化
                    modelSelect.disabled = true;
                }
                
                showStatus('✓ モデル一覧を取得しました（モデル選択は固定されています）');
            } else {
                showStatus('⚠ 利用可能なモデルが見つかりません', true);
            }
        } else {
            throw new Error('HTTP ' + response.status);
        }
    } catch (error) {
        showStatus('✗ モデル一覧取得エラー: ' + error.message, true);
    }
    
    loadBtn.disabled = false;
    loadBtn.textContent = 'モデル一覧取得';
}



function addMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = 'message ' + (isUser ? 'user' : 'ai');
    div.textContent = text;
    document.getElementById('messages').appendChild(div);
    document.getElementById('messages').scrollTop = 999999;
}

function showStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'status ' + (isError ? 'error' : 'success');
    statusDiv.textContent = message;
}

// CORSを回避するため、シンプルなfetchを使用
async function testConnection() {
    const testBtn = document.getElementById('testBtn');
    const apiUrl = document.getElementById('apiUrl').value;
    const selectedModel = document.getElementById('modelSelect').value;
    
    if (!selectedModel) {
        showStatus('⚠ モデルを選択してください', true);
        return;
    }
    
    testBtn.disabled = true;
    testBtn.textContent = '接続中...';
    
    try {
        // CORSエラーを回避するため、直接チャット機能をテスト
        const testResponse = await fetch(apiUrl + '/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: document.getElementById('modelSelect').value,
                messages: [
                    { role: "user", content: "Hello" }
                ],
                max_tokens: 10
            })
        });
        
        if (testResponse.ok) {
            const data = await testResponse.json();
            showStatus('✓ API接続成功！LMStudioと正常に通信できます');
        } else {
            throw new Error('HTTP ' + testResponse.status);
        }
    } catch (error) {
        showStatus('✗ 接続エラー: ' + error.message, true);
    }
    
    testBtn.disabled = false;
    testBtn.textContent = '接続テスト';
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const apiUrl = document.getElementById('apiUrl').value;
    const modelName = document.getElementById('modelSelect').value;
    
    const message = input.value.trim();
    if (!message) return;
    
    if (!modelName) {
        showStatus('⚠ モデルを選択してください', true);
        return;
    }

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

        const response = await fetch(apiUrl + '/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                stream: true  // ストリーミングを有効化
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // ストリーミング応答を処理
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            showStatus('✓ 応答完了');
                            break; // returnではなくbreakを使用
                        }

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                const content = parsed.choices[0].delta.content;
                                aiMessageDiv.textContent += content;
                                document.getElementById('messages').scrollTop = 999999;
                            }
                        } catch (e) {
                            // JSONパースエラーは無視
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
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
    messagesDiv.innerHTML = '';
    showStatus('✓ チャット履歴をクリアしました');
}

// 初期化
//addMessage('CORS対応版チャットシステム起動', false);
//addMessage('まず「接続テスト」で動作確認してください', false);

// ページ読み込み時にモデル一覧を自動取得
document.addEventListener('DOMContentLoaded', function() {
    // 少し遅延させてからモデル一覧を取得
    setTimeout(() => {
        loadModels();
    }, 500);
});
