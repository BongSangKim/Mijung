package com.example.mijung.ingredient.controller;

import com.example.mijung.common.dto.PaginationAndFilteringDto;
import com.example.mijung.common.dto.RecipeListResponse;
import com.example.mijung.common.dto.ResponseDTO;
import com.example.mijung.ingredient.dto.*;
import com.example.mijung.ingredient.service.IngredientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ingredients")
@Tag(name = "식재료", description = "식재료관련 API")
public class IngredientController {
    private final IngredientService ingredientService;

    /**
     * 식재료 목록 조회
     *
     * @param dto category, page, perPage, keyword
     * @return 페이지 번호에 맞는 식재료 수 만큼 식재료 목록을 포함하는 ResponseEntity 객체를 반환합니다. 식재료 목록 조회에 실패하면 에러 코드를 담은 * ResponseEntity를
     * 반환합니다.
     */
    @GetMapping("/search")
    @Operation(summary = "식재료 목록 조회", description = "페이지 번호에 맞는 식재료 수 만큼 식재료 목록을 포함하는 ResponseEntity 객체를 반환합니다. 식재료 목록 조회에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.")
    @ApiResponse(responseCode = "200", description = "성공")
    public ResponseEntity<ResponseDTO<?>> getIngredientList(@Valid @ModelAttribute PaginationAndFilteringDto dto) {

        ResponseDTO<List<IngredientViewResponse>> result = ingredientService.getIngredientList(dto);

        HttpStatus status = result.getData().isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK;

        return ResponseEntity.status(status).body(result);

    }

    /**
     * 식재료 시세 조회
     *
     * @param request period, change, count
     * @return 기간과 등락에 맞는  count 수 만큼 식재료 목록을 포함하는 ResponseEntity 객체를 반환합니다. 식재료 시세 조회에 실패하면 에러 코드를 담은 * ResponseEntity를
     * 반환합니다.
     */
    @GetMapping("/price")
    @Operation(summary = "식재료 시세 조회", description = "기간과 등락에 맞는  count 수 만큼 식재료 목록을 포함하는 ResponseEntity 객체를 반환합니다. 식재료 시세 조회에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.")
    @ApiResponse(responseCode = "200", description = "성공")
    @ApiResponse(responseCode = "400", description = "식재료 가격 정보 조회 실패", content = @Content)
    @ApiResponse(responseCode = "204", description = "식재료 시세 조회 성공 - 시세 정보 없음", content = @Content)
    public ResponseEntity<ResponseDTO<?>> getIngredientSiseList(@Valid @ModelAttribute IngredientSiseRequest request) {

        List<IngredientViewResponse> result = ingredientService.getIngredientSiseList(request);

        return ResponseEntity.status(HttpStatus.OK).body(ResponseDTO.from(result));
    }

    /**
     * 식재료 검색 자동완성 조회
     *
     * @param search 검색어
     * @return 검색어를 포함하는 5개의 식재료 Id, 이름을 포함하는 ResponseEntity 객체를 반환합니다. 식재료 검색 자동완성 조회에 실패하면 에러 코드를 담은 * ResponseEntity를
     * 반환합니다.
     */
    @GetMapping("/search/{search}")
    @Operation(summary = "식재료 검색 자동완성 조회", description = "검색어를 포함하는 5개의 식재료 Id, 이름을 포함하는 ResponseEntity 객체를 반환합니다. 식재료 검색 자동완성 조회에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.")
    @ApiResponse(responseCode = "200", description = "성공")
    public ResponseEntity<ResponseDTO<?>> getIngredientSearch(@PathVariable("search") String search) {

        List<IngredientSearchResponse> result = ingredientService.getIngredientSearch(search);

        HttpStatus status = result.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK;

        return ResponseEntity.status(status).body(ResponseDTO.from(result));
    }

    /**
     * 식재료 상세보기 - 정보
     *
     * @param ingredientId 식재료 ID
     * @return 식재료 정보를 포함하는 ResponseEntity 객체를 반환합니다. 식재료 상세보기(정보)에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.
     */
    @GetMapping("/{ingredientId}/info")
    @Operation(summary = "식재료 상세보기 - 정보", description = "식재료 정보를 포함하는 ResponseEntity 객체를 반환합니다. 식재료 상세보기(정보)에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "식재료 상세보기(정보) 조회 성공"),
            @ApiResponse(responseCode = "404", description = "식재료 상세보기(정보) 조회 실패", content = @Content)
    })
    public ResponseEntity<ResponseDTO<IngredientInfoViewResponse>> getIngredientInfo(
            @PathVariable("ingredientId") @Schema(description = "식재료 ID", example = "1") Integer ingredientId) {

        IngredientInfoViewResponse result = ingredientService.getIngredientInfo(ingredientId);

        return ResponseEntity.status(HttpStatus.OK).body(ResponseDTO.from(result));
    }

    /**
     * 식재료 상세보기 - 시세 그래프
     *
     * @param ingredientId 식재료 ID
     * @return 식재료 시세 정보를 포함하는 ResponseEntity 객체를 반환합니다. 식재료 상세보기(시세 그래프)에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.
     */
    @GetMapping("/{ingredientId}/price-graph")
    @Operation(summary = "식재료 상세보기 - 시세 그래프", description = "식재료 시세 정보를 포함하는 ResponseEntity 객체를 반환합니다. 식재료 상세보기(시세 그래프)에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.")
    @ApiResponse(responseCode = "200", description = "성공")
    public ResponseEntity<ResponseDTO<?>> getIngredientPriceGraph(@PathVariable("ingredientId") Integer ingredientId) {

        List<IngredientPriceGraphViewResponse> result = ingredientService.getIngredientPriceGraph(ingredientId);

        HttpStatus status = result.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK;

        return ResponseEntity.status(status).body(ResponseDTO.from(result));
    }

    /**
     * 식재료 상세보기 - 추천 레시피
     *
     * @param ingredientId 식재료 ID
     * @return 레시피 정보를 포함하는 ResponseEntity 객체를 반환합니다. 식재료 상세보기(추천 레시피)에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.
     */
    @GetMapping("/{ingredientId}/recommend-recipes")
    @Operation(summary = "식재료 상세보기 - 추천 레시피", description = "레시피 정보를 포함하는 ResponseEntity 객체를 반환합니다. 식재료 상세보기(추천 레시피)에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "식재료 상세보기(추천 레시피) 조회 성공"),
        @ApiResponse(responseCode = "204", description = "식재료 상세보기(추천 레시피) 조회 성공 - 추천 레시피가 없는 경우", content = @Content),
        @ApiResponse(responseCode = "404", description = "식재료 상세보기(추천 레시피) 조회 실패", content = @Content)
    })
    public ResponseEntity<ResponseDTO<List<RecipeListResponse>>> getIngredientRecommendRecipe(
        @PathVariable("ingredientId") @Schema(description = "식재료 ID", example = "1") Integer ingredientId) {

        List<RecipeListResponse> result = ingredientService.getIngredientRecommendRecipe(ingredientId);

        HttpStatus status = result.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK;

        return ResponseEntity.status(status).body(ResponseDTO.from(result));
    }

    @GetMapping("/{ingredientId}/network-graph")
    public ResponseEntity<List<IngredientCosineResponse>> getTopCosineIngredients(
            @PathVariable("ingredientId") Integer ingredientId,
            @RequestParam(defaultValue = "100") int count) {

        List<IngredientCosineResponse> result = ingredientService.getTopCosineIngredients(ingredientId, count);

        HttpStatus status = result.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK;
        return ResponseEntity.status(status).body(result);
    }
}
