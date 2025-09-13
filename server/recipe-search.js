const fs = require('fs');
const path = require('path');

class RecipeSearchEngine {
    constructor() {
        this.recipes = [];
        this.loadRecipes();
    }

    loadRecipes() {
        const recipesDir = path.join(__dirname, '..', 'data', 'recipes');
        
        try {
            const files = fs.readdirSync(recipesDir);
            this.recipes = [];
            
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    const filePath = path.join(recipesDir, file);
                    const recipeData = fs.readFileSync(filePath, 'utf8');
                    this.recipes.push(JSON.parse(recipeData));
                }
            });
            
            console.log(`✅ ${this.recipes.length}件のレシピを読み込みました`);
        } catch (error) {
            console.error('❌ レシピファイルの読み込みエラー:', error);
            this.recipes = [];
        }
    }

    searchRecipes(keyword, ingredients = [], category = null) {
        console.log(`🔍 レシピ検索: キーワード="${keyword}", 材料=[${ingredients.join(', ')}], カテゴリ="${category}"`);
        
        if (!keyword && ingredients.length === 0 && !category) {
            return this.recipes.slice(0, 5); // デフォルトで最初の5件を返す
        }

        const results = this.recipes.map(recipe => {
            let score = 0;
            const searchText = keyword ? keyword.toLowerCase() : '';

            // 料理名マッチング: +20点
            if (searchText && recipe.title.toLowerCase().includes(searchText)) {
                score += 20;
                console.log(`  📝 "${recipe.title}": 料理名マッチ +20点`);
            }

            // 材料マッチング: +10点×個数
            if (ingredients.length > 0) {
                const matchedIngredients = ingredients.filter(ing => 
                    recipe.ingredients.some(recipeIng => 
                        recipeIng.toLowerCase().includes(ing.toLowerCase())
                    )
                );
                if (matchedIngredients.length > 0) {
                    const points = matchedIngredients.length * 10;
                    score += points;
                    console.log(`  🥬 "${recipe.title}": 材料マッチ ${matchedIngredients.length}個 +${points}点`);
                }
            }

            // メイン材料マッチング: +15点
            if (searchText) {
                const mainMatches = recipe.main_ingredients.filter(main => 
                    main.toLowerCase().includes(searchText)
                );
                if (mainMatches.length > 0) {
                    score += 15 * mainMatches.length;
                    console.log(`  🍖 "${recipe.title}": メイン材料マッチ ${mainMatches.length}個 +${15 * mainMatches.length}点`);
                }
            }

            // カテゴリマッチング: +10点
            if (category && recipe.categories.includes(category)) {
                score += 10;
                console.log(`  📂 "${recipe.title}": カテゴリマッチ +10点`);
            }

            return { ...recipe, score };
        });

        // スコア順でソート（高い順）
        const sortedResults = results
            .filter(recipe => recipe.score > 0)
            .sort((a, b) => b.score - a.score);

        console.log(`📊 検索結果: ${sortedResults.length}件`);
        return sortedResults.slice(0, 10); // 上位10件を返す
    }

    getRecipeDetail(recipeId) {
        console.log(`📖 レシピ詳細取得: ID="${recipeId}"`);
        
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (recipe) {
            console.log(`✅ レシピ見つかりました: "${recipe.title}"`);
            return recipe;
        } else {
            console.log(`❌ レシピが見つかりません: ID="${recipeId}"`);
            return null;
        }
    }

    getUserFavorites() {
        console.log(`⭐ お気に入りレシピ取得`);
        
        // 簡単なお気に入り実装（定番カテゴリの料理を返す）
        const favorites = this.recipes.filter(recipe => 
            recipe.categories.includes('teiban')
        );
        
        console.log(`📊 お気に入り: ${favorites.length}件`);
        return favorites;
    }

    getAllRecipes() {
        console.log(`📚 全レシピ取得: ${this.recipes.length}件`);
        return this.recipes;
    }
}

module.exports = RecipeSearchEngine;