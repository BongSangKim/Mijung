package com.example.mijung.common.dto;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
public class PaginationAndSearchDto {

    @NotNull
    @Positive
    private Integer page; // 페이지 번호

    @NotNull
    @Positive
    private Integer perPage; // 페이지 당 항목 수

    private String keyword;  // 검색 내용
}
