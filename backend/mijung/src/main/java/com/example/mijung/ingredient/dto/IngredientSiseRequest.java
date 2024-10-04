package com.example.mijung.ingredient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
