const express = require('express');
const cors = require('cors');
const path = require('path');
const RecipeTools = require('./recipe-tools');

const app = express();
const PORT = 3000;

// Recipe Tools インスタンス作成
const recipeTools = new RecipeTools();

// CORS設定
app.use(cors());
app.use(express.json());

// 静的ファイル提供（Recipe_SLMフロントエンド）
app.use(express.static(path.join(__dirname, '..')));

// LM Studio API プロキシエンドポイント
app.post('/v1/chat/completions', async (req, res) => {
    try {
        const { messages, tools } = req.body;
        
        console.log('🚀 Chat API呼び出し');
        console.log('📨 メッセージ数:', messages.length);
        
        // Function Callingツールを自動注入
        const toolsToUse = recipeTools.getToolsDefinition();
        console.log('🔧 利用可能なツール:', toolsToUse.length, '個');

        // LM Studio APIに転送
        const lmStudioResponse = await fetch('http://192.168.2.107:1234/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...req.body,
                tools: toolsToUse,
                tool_choice: 'auto'
            })
        });

        const lmStudioData = await lmStudioResponse.json();
        
        // Function Calling検出と実行
        const responseMessage = lmStudioData.choices[0].message;
        
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            console.log(`🔧 Function Calling検出: ${responseMessage.tool_calls.length}個`);
            
            const toolResults = [];
            
            for (const toolCall of responseMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const parameters = JSON.parse(toolCall.function.arguments);
                
                console.log(`⚙️ 関数「${functionName}」実行中...`);
                
                const result = await recipeTools.executeFunction(functionName, parameters);
                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    content: JSON.stringify(result, null, 2)
                });
            }
            
            // Function Calling情報をレスポンスに含める
            const toolCallsInfo = responseMessage.tool_calls.map(call => ({
                function: call.function,
                id: call.id
            }));
            
            // 関数実行結果を含めて再度LM Studioにリクエスト
            const finalMessages = [
                ...messages,
                responseMessage,
                ...toolResults
            ];
            
            console.log('🔄 関数実行結果を含めて最終応答生成...');
            
            const finalResponse = await fetch('http://192.168.2.107:1234/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...req.body,
                    messages: finalMessages,
                    tools: toolsToUse,
                    tool_choice: 'none'
                })
            });
            
            const finalData = await finalResponse.json();
            console.log('✅ 最終応答生成完了');
            
            // Function Calling情報を含めたレスポンスを作成
            const enhancedResponse = {
                ...finalData,
                function_calls_executed: toolCallsInfo,
                tool_results: toolResults
            };
            
            res.json(enhancedResponse);
        } else {
            console.log('💬 通常の応答');
            res.json(lmStudioData);
        }
        
    } catch (error) {
        console.error('❌ API エラー:', error);
        res.status(500).json({ 
            error: '内部サーバーエラー',
            message: error.message 
        });
    }
});

// レシピAPI エンドポイント（デバッグ用）
app.get('/api/recipes', (req, res) => {
    const recipes = recipeTools.searchEngine.getAllRecipes();
    res.json({
        success: true,
        count: recipes.length,
        recipes: recipes
    });
});

app.get('/api/recipes/:id', (req, res) => {
    const recipe = recipeTools.searchEngine.getRecipeDetail(req.params.id);
    if (recipe) {
        res.json({ success: true, recipe });
    } else {
        res.status(404).json({ 
            success: false, 
            message: 'レシピが見つかりません' 
        });
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log('🍽️ Recipe SLM Function Calling サーバー起動');
    console.log(`📡 サーバーアドレス: http://localhost:${PORT}`);
    console.log('🔗 LM Studio API: http://192.168.2.107:1234');
    console.log(`🔧 Function Tools: ${recipeTools.getToolsDefinition().length}個登録済み`);
    console.log('✅ 準備完了 - ブラウザでアクセスしてテストしてください');
});

module.exports = app;