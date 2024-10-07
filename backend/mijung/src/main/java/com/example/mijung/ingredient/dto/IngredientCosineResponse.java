package com.example.mijung.ingredient.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(staticName = "of")
public class IngredientCosineResponse {
    private Integer ingredientId;
    private String itemName;
    private Double cosine;
}