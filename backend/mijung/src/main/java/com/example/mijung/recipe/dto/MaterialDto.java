package com.example.mijung.recipe.dto;

import com.example.mijung.material.entity.Material;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MaterialDto {
    private final Integer materialId;
    private final String name;
    private final String capacity;
    private final String type;
    private final Integer ingredientId;


    public static MaterialDto of(Integer materialId, Integer ingredientId) {
        return MaterialDto.builder()
                .materialId(materialId)
                .name("감자")
                .capacity("1개")
                .type("재료")
                .ingredientId(ingredientId)
                .build();
    }
    public static MaterialDto of(Material material) {
        return MaterialDto.builder()
                .materialId(material.getId())
                .name(material.getName())
                .capacity(material.getCapacity())
                .type(material.getType())
                .ingredientId(material.getIngredient() != null ? material.getIngredient().getId() : null)
                .build();
    }
}
