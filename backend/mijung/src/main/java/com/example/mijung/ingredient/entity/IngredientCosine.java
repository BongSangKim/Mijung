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
public class IngredientCosine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ingredient_cosine_id", updatable = false, nullable = false)
    private Integer id;

    @Column(name = "ingredient_id_1", nullable = false)
    private Integer ingredientId1;

    @Column(name = "ingredient_id_2", nullable = false)
    private Integer ingredientId2;

    @Column(nullable = false)
    private Double cosine;

    @Builder
    public IngredientCosine(Integer id, Integer ingredientId1, Integer ingredientId2, Double cosine) {
        this.id = id;
        this.ingredientId1 = ingredientId1;
        this.ingredientId2 = ingredientId2;
        this.cosine = cosine;
    }
}
