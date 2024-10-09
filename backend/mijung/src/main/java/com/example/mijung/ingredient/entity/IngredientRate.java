package com.example.mijung.ingredient.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class IngredientRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ingredient_rate_id", updatable = false, nullable = false)
    private Integer id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "week_increase_rate", nullable = false)
    private Float weekIncreaseRate;

    @Column(name = "month_increase_rate", nullable = false)
    private Float monthIncreaseRate;

    @Column(name = "year_increase_rate", nullable = false)
    private Float yearIncreaseRate;

    @Column(name = "week_increase_price", nullable = false)
    private Integer weekIncreasePrice;

    @Column(name = "month_increase_price", nullable = false)
    private Integer monthIncreasePrice;

    @Column(name = "year_increase_price", nullable = false)
    private Integer yearIncreasePrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Builder
    public IngredientRate(Integer id, LocalDate date, Float weekIncreaseRate, Integer weekIncreasePrice,
                          Ingredient ingredient) {
        this.id = id;
        this.date = date;
        this.weekIncreaseRate = weekIncreaseRate;
        this.weekIncreasePrice = weekIncreasePrice;
        this.ingredient = ingredient;
    }

    ;
}
