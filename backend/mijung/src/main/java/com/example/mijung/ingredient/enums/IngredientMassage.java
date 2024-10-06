package com.example.mijung.ingredient.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum IngredientMassage {
    INGREDIENT_NOT_FOUND("Ingredient not found."),
    CATEGORY_NOT_FOUND("Category not found."),
    SEARCH_CONDITION_NOT_FOUND("Search condition not found.");
    private final String message;
}
