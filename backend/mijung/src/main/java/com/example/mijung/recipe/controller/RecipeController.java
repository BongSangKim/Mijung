package com.example.mijung.recipe.controller;

import com.example.mijung.common.dto.PaginationAndSearchDto;
import com.example.mijung.common.dto.RecipeListResponse;
import com.example.mijung.common.dto.ResponseDTO;
import com.example.mijung.recipe.dto.RecipeSearchResponse;
import com.example.mijung.recipe.dto.RecipeViewResponse;
import com.example.mijung.recipe.service.RecipeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import javax.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/recipes")
public class RecipeController {
    private final RecipeService recipeService;

    /**
     * 레시피 목록 조회
     *
     * @param dto page, perPage, keyword
     * @return 페이지 번호에 맞는 레시피 수 만큼 레시피 목록을 포함하는 ResponseEntity 객체를 반환합니다. 레시피 목록 조회에 실패하면 에러 코드를 담은 * ResponseEntity를
     * 반환합니다.
     */
    @GetMapping("/search")
    @Operation(summary = "레시피 목록 조회", description = "페이지 번호에 맞는 레시피 수 만큼 레시피 목록을 포함하는 ResponseEntity 객체를 반환합니다. 레시피 목록 조회에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.")
    @ApiResponse(responseCode = "200", description = "성공")
    public ResponseEntity<ResponseDTO<?>> getRecipeList(@Valid @ModelAttribute PaginationAndSearchDto dto) {

        ResponseDTO<List<RecipeListResponse>> result = recipeService.getRecipeList(dto);

        HttpStatus status = result.getData().isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK;

        return ResponseEntity.status(status).body(result);
    }

    /**
     * 레시피 검색 자동완성 조회
     *
     * @param search 검색어
     * @return 검색어를 포함하는 5개의 레시피 Id, 이름을 포함하는 ResponseEntity 객체를 반환합니다. 레시피 검색 자동완성 조회에 실패하면 에러 코드를 담은 * ResponseEntity를
     * 반환합니다.
     */
    @GetMapping("/search/{search}")
    @Operation(summary = "레시피 검색 자동완성 조회", description = "검색어를 포함하는 5개의 레시피 Id, 이름을 포함하는 ResponseEntity 객체를 반환합니다. 레시피 검색 자동완성 조회에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.")
    @ApiResponse(responseCode = "200", description = "성공")
    public ResponseEntity<ResponseDTO<?>> getIngredientSearch(@PathVariable("search") String search) {

        List<RecipeSearchResponse> result = recipeService.getRecipeSearch(search);

        HttpStatus status = result.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK;

        return ResponseEntity.status(status).body(ResponseDTO.from(result));
    }

    /**
     * 레시피 상세보기
     *
     * @param recipeId 레시피 ID
     * @return 레시피 정보를 포함하는 ResponseEntity 객체를 반환합니다. 레시피 상세보기에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.
     */
    @GetMapping("/{recipeId}")
    @Operation(summary = "레시피 상세보기", description = "레시피 정보를 포함하는 ResponseEntity 객체를 반환합니다. 레시피 상세보기에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.")
    @ApiResponse(responseCode = "200", description = "성공")
    public ResponseEntity<ResponseDTO<?>> getRecipe(@PathVariable("recipeId") Integer recipeId) {

        RecipeViewResponse result = recipeService.getRecipe(recipeId);

        return ResponseEntity.status(HttpStatus.OK).body(ResponseDTO.from(result));
    }
}
