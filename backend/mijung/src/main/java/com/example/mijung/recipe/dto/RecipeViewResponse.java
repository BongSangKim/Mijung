package com.example.mijung.recipe.dto;

import java.util.List;

import com.example.mijung.recipe.entity.Recipe;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecipeViewResponse {
    private final Integer recipeId;
    private final String name;
    private final String kind;
    private final String image;
    private final String inbun;
    private final String level;
    private final String time;
    private final List<MaterialDto> materials;
    private final List<EtcDto> etc;
    private final List<StepDto> steps;


    public static RecipeViewResponse of(Integer recipeId, List<MaterialDto> material, List<EtcDto> etc,
                                        List<StepDto> step) {
        return RecipeViewResponse.builder()
                .recipeId(recipeId)
                .name("감자탕")
                .kind("국/탕")
                .image("https://picsum.photos/250/250")
                .inbun("1인분")
                .level("아무나")
                .time("5분이내")
                .materials(material)
                .etc(etc)
                .steps(step)
                .build();
    }

    public static RecipeViewResponse of(Recipe recipe, List<MaterialDto> materials, List<EtcDto> etcs, List<StepDto> steps) {
        return RecipeViewResponse.builder()
                .recipeId(recipe.getId())
                .name(recipe.getName())
                .kind(recipe.getKind() != null ? recipe.getKind().getDisplayName() : null)
                .image(recipe.getImage())
                .inbun(recipe.getInbun() != null ? recipe.getInbun().getDisplayName() : null)
                .level(recipe.getLevel() != null ? recipe.getLevel().getDisplayName() : null)
                .time(recipe.getCookingTime() != null ? recipe.getCookingTime().getDisplayName() : null)
                .materials(materials)
                .etc(etcs)
                .steps(steps)
                .build();
    }
}
