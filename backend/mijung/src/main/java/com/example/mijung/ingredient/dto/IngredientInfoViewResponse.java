package com.example.mijung.ingredient.dto;

import com.example.mijung.ingredient.entity.Ingredient;
import com.example.mijung.ingredient.entity.IngredientInfo;
import com.example.mijung.ingredient.entity.IngredientRate;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "식재료 정보 응답")
public class IngredientInfoViewResponse {

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
    @Schema(description = "배너 색", example = "#FFFFFF, #FFFFFF, #FFFFFF")
    private final String colorHex;

    public static IngredientInfoViewResponse of(Ingredient ingredient) {
        return IngredientInfoViewResponse.builder()
                .ingredientId(ingredient.getId())
                .name(ingredient.getItemName())
                .image(ingredient.getImage())
                .colorHex(ingredient.getColorHex())
                .build();
    }

    public static IngredientInfoViewResponse of(Ingredient ingredient, IngredientInfo ingredientInfo, IngredientRate ingredientRate) {
        return IngredientInfoViewResponse.builder()
                .ingredientId(ingredient.getId())
                .name(ingredient.getItemName())
                .retailUnit(ingredient.getRetailUnit())
                .retailUnitsize(ingredient.getRetailUnitsize())
                .image(ingredient.getImage())
                .price(ingredientInfo == null ? null : ingredientInfo.getPrice())
                .changeRate(ingredientRate == null ? null : ingredientRate.getWeekIncreaseRate())
                .changePrice(ingredientRate == null ? null : ingredientRate.getWeekIncreasePrice())
                .colorHex(ingredient.getColorHex())
                .build();
    }
}
