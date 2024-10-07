package com.example.mijung.ingredient.dto;

import com.example.mijung.ingredient.entity.Ingredient;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "식재료 가격 정보 응답")
public class IngredientViewResponse {

    @Schema(description = "식재료 ID", example = "1")
    private final Integer ingredientId;
    @Schema(description = "식재료명", example = "감자")
    private final String name;
    @Schema(description = "소매출하단위", example = "g")
    private final String retailUnit;
    @Schema(description = "소매출하단위 크기", example = "100")
    private final String retailUnitsize;
    @Schema(description = "이미지 링크", example = "https://recipe1.ezmember.co.kr/cache/bbs/2016/08/25/e1ecc151809f90a265886b51e9a44bd9.jpg")
    private final String image;
    @Schema(description = "현재 가격", example = "900")
    private final Integer price;
    @Schema(description = "변동률", example = "0.5")
    private final Float changeRate;
    @Schema(description = "변동 가격", example = "9")
    private final Integer changePrice;


    public static IngredientViewResponse of(Ingredient ingredient) {
        return IngredientViewResponse.builder()
                .ingredientId(ingredient.getId())
                .name(ingredient.getItemName())
                .image(ingredient.getImage())
                .build();
    }

    public static IngredientViewResponse of(Ingredient ingredient, Integer price, Float changeRate,
                                                Integer changePrice) {
        return IngredientViewResponse.builder()
                .ingredientId(ingredient.getId())
                .name(ingredient.getItemName())
                .retailUnit(ingredient.getRetailUnit())
                .retailUnitsize(ingredient.getRetailUnitsize())
                .image(ingredient.getImage())
                .price(price)
                .changeRate(changeRate)
                .changePrice(changePrice)
                .build();
    }
}
