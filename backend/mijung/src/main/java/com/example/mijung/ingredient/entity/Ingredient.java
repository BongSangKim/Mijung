package com.example.mijung.ingredient.entity;

import com.example.mijung.material.entity.Material;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Ingredient {
    @Id
    @Column(name = "ingredient_id", updatable = false, nullable = false)
    private Integer id;

    @Column(name = "item_category_code", nullable = false, length = 20)
    private String itemCategoryCode;

    @Column(name = "item_category_name", nullable = false, length = 20)
    private String itemCategoryName;

    @Column(name = "item_code", nullable = false, length = 10)
    private String itemCode;

    @Column(name = "item_name", nullable = false, length = 20)
    private String itemName;

    @Column(name = "kind_code", nullable = false, length = 10)
    private String kindCode;

    @Column(name = "kind_name", nullable = false, length = 20)
    private String kindName;

    @Column(name = "retail_unit", length = 10)
    private String retailUnit;

    @Column(name = "retail_unitsize", length = 10)
    private String retailUnitsize;

    @Column(name = "product_rank_code", nullable = false, length = 3)
    private String productRankCode;

    @Column
    private String image;

    @Column(name = "is_priced", nullable = false)
    private Boolean isPriced;

    @Column
    private String colorHex;

    @OneToMany(mappedBy = "ingredient")
    private List<Material> materials = new ArrayList<>();

    @OneToMany(mappedBy = "ingredient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IngredientInfo> ingredientInfos = new ArrayList<>();

    @OneToMany(mappedBy = "ingredient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IngredientRate> ingredientRates = new ArrayList<>();

    @OneToMany(mappedBy = "ingredient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IngredientPredict> ingredientPredicts = new ArrayList<>();


    public IngredientInfo getLatestIngredientInfo() {
        return ingredientInfos.stream()
                .max((info1, info2) -> info1.getDate().compareTo(info2.getDate()))
                .orElse(null);
    }

    public IngredientRate getLatestIngredientRate() {
        return ingredientRates.stream()
                .max((rate1, rate2) -> rate1.getDate().compareTo(rate2.getDate()))
                .orElse(null);
    }

    @Builder
    public Ingredient(Integer id, String itemCategoryCode, String itemCategoryName, String itemCode, String itemName,
                      String kindCode, String kindName, String retailUnit, String retailUnitsize, boolean isPriced) {
        this.id = id;
        this.itemCategoryCode = itemCategoryCode;
        this.itemCategoryName = itemCategoryName;
        this.itemCode = itemCode;
        this.itemName = itemName;
        this.kindCode = kindCode;
        this.kindName = kindName;
        this.retailUnit = retailUnit;
        this.retailUnitsize = retailUnitsize;
        this.isPriced = isPriced;
    }
}