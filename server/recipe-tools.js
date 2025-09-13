const RecipeSearchEngine = require('./recipe-search');

class RecipeTools {
    constructor() {
        this.searchEngine = new RecipeSearchEngine();
        
        // Function Tools定義
        this.tools = [
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
    }

    // Function Callingで実行される関数
    async executeFunction(functionName, parameters) {
        console.log(`⚙️ 関数「${functionName}」実行中...`);
        console.log(`📝 パラメータ:`, parameters);

        try {
            switch (functionName) {
                case 'search_recipes':
                    return await this.searchRecipes(parameters);
                
                case 'get_recipe_detail':
                    return await this.getRecipeDetail(parameters);
                
                case 'get_user_favorites':
                    return await this.getUserFavorites(parameters);
                
                default:
                    throw new Error(`未知の関数: ${functionName}`);
            }
        } catch (error) {
            console.error(`❌ 関数実行エラー (${functionName}):`, error);
            return {
                error: true,
                message: `関数実行エラー: ${error.message}`
            };
        }
    }

    async searchRecipes(parameters) {
        const { keyword = '', ingredients = [], category = null } = parameters;
        
        const results = this.searchEngine.searchRecipes(keyword, ingredients, category);
        
        return {
            success: true,
            count: results.length,
            recipes: results.map(recipe => ({
                id: recipe.id,
                title: recipe.title,
                cooking_time: recipe.cooking_time,
                main_ingredients: recipe.main_ingredients,
                categories: recipe.categories,
                score: recipe.score
            }))
        };
    }

    async getRecipeDetail(parameters) {
        const { recipe_id } = parameters;
        
        const recipe = this.searchEngine.getRecipeDetail(recipe_id);
        
        if (recipe) {
            return {
                success: true,
                recipe: recipe
            };
        } else {
            return {
                success: false,
                message: `レシピID "${recipe_id}" が見つかりません`
            };
        }
    }

    async getUserFavorites(parameters) {
        const favorites = this.searchEngine.getUserFavorites();
        
        return {
            success: true,
            count: favorites.length,
            recipes: favorites.map(recipe => ({
                id: recipe.id,
                title: recipe.title,
                cooking_time: recipe.cooking_time,
                main_ingredients: recipe.main_ingredients,
                categories: recipe.categories
            }))
        };
    }

    // Function Tools定義を取得
    getToolsDefinition() {
        return this.tools;
    }
}

module.exports = RecipeTools;