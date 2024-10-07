package com.example.mijung.cart.dto;

import com.example.mijung.ingredient.entity.Ingredient;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "식재료 추천 응답")
public class RecommendIngredientListResponse {
    @Schema(description = "식재료 ID", example = "1")
    private final Integer ingredientId;
    @Schema(description = "식재료명", example = "감자")
    private final String name;
    @Schema(description = "이미지 링크", example = "https://recipe1.ezmember.co.kr/cache/bbs/2016/08/25/e1ecc151809f90a265886b51e9a44bd9.jpg")
    private final String image;

    public static RecommendIngredientListResponse from(Ingredient ingredient) {
        return RecommendIngredientListResponse.builder()
                .ingredientId(ingredient.getId())
                .name(ingredient.getItemName())
                .image(ingredient.getImage())
                .build();
    }
}
