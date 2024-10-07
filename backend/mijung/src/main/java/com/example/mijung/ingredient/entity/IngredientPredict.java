package com.example.mijung.ingredient.entity;


import javax.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class IngredientPredict {
    @Id
    @Column(name = "ingredient_predict_id", updatable = false, nullable = false)
    private Integer id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer predictedPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Builder
    public IngredientPredict(Integer id, LocalDate date, Integer predictedPrice, Ingredient ingredient) {
        this.id = id;
        this.date = date;
        this.predictedPrice = predictedPrice;
        this.ingredient = ingredient;
    }
}
