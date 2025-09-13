const RecipeTools = require('../server/recipe-tools');

async function testRecipeTools() {
    console.log('🧪 Recipe Function Calling テスト開始\n');
    
    const recipeTools = new RecipeTools();
    
    console.log('=== テスト1: レシピ検索 ===');
    const searchResult = await recipeTools.executeFunction('search_recipes', {
        keyword: '豚肉',
        ingredients: [],
        category: null
    });
    console.log('検索結果:', JSON.stringify(searchResult, null, 2));
    console.log('');
    
    console.log('=== テスト2: レシピ詳細取得 ===');
    const detailResult = await recipeTools.executeFunction('get_recipe_detail', {
        recipe_id: 'recipe_001'
    });
    console.log('詳細結果:', JSON.stringify(detailResult, null, 2));
    console.log('');
    
    console.log('=== テスト3: お気に入り取得 ===');
    const favoritesResult = await recipeTools.executeFunction('get_user_favorites', {});
    console.log('お気に入り結果:', JSON.stringify(favoritesResult, null, 2));
    console.log('');
    
    console.log('=== テスト4: 材料検索 ===');
    const ingredientResult = await recipeTools.executeFunction('search_recipes', {
        keyword: '',
        ingredients: ['なす'],
        category: null
    });
    console.log('材料検索結果:', JSON.stringify(ingredientResult, null, 2));
    console.log('');
    
    console.log('✅ 全テスト完了');
}

// テスト実行
if (require.main === module) {
    testRecipeTools().catch(console.error);
}

module.exports = testRecipeTools;