package com.example.mijung.cart.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "식재료 추천 요청")
public class RecommendIngredientListRequest {

    @Schema(description = "식재료 리스트")
    @NotNull(message = "empty ingredients.")
    @Size(min = 2, message = "ingredients must be greater than 1.")
    private List<Integer> ingredients = new ArrayList<>();

    @Schema(description = "응답 데이터 개수")
    @NotNull(message = "empty count.")
    @Positive(message = "not count positive.")
    private Integer count;
}
