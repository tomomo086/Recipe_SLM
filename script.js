// 固定のAPI設定
const API_CONFIG = {
    url: 'http://192.168.2.107:1234',
    model: 'local-model' // デフォルトモデル名
};

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

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // スマホ最適化を適用
    optimizeForMobile();
    
    // タイピングアニメーション開始
    startTypingAnimation();
    
    // 起動メッセージを表示
    showStatus('✓ ポケット献立アシスタントが起動しました');
});
