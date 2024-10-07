package com.example.mijung.ingredient.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class IngredientSiseRequest {
    @NotBlank(message = "empty period.")
    private String period;

    @NotBlank(message = "empty change.")
    private String change;

    @NotNull(message = "empty count.")
    @Positive(message = "not count positive.")
    private Integer count;
}
