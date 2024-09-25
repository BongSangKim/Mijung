package com.example.mijung.recipe.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StepDto {
    private final Integer stepId;
    private final String content;
    private final String image;


    public static StepDto of(Integer stepId) {
        return StepDto.builder()
                .stepId(stepId)
                .content("당근과 양파는 깨끗히 씻으신 후에 채썰어 준비한 후 후라이팬에 기름을 두르고 팬을 달군 후 당근, 양파를 살짝 볶아주세요.")
                .image("https://picsum.photos/200/200?random=1")
                .build();
    }
}
