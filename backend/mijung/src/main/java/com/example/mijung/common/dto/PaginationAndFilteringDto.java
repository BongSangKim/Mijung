package com.example.mijung.common.dto;

import javax.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PaginationAndFilteringDto extends PaginationAndSearchDto {

    @NotBlank
    private String category = "all"; // 분류, 기본값 설정
}
