package com.example.mijung.cart.controller;

import com.example.mijung.cart.dto.RecommendIngredientListRequest;
import com.example.mijung.cart.dto.RecommendIngredientListResponse;
import com.example.mijung.cart.service.CartService;
import com.example.mijung.common.dto.ResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/carts")
@Tag(name = "추천", description = "추천관련 API")
public class CartController {
    private final CartService cartService;

    /**
     * 식재료 추천
     *
     * @param dto ingredients, count
     * @return ingredients와 많이 사용된 count 수 만큼 식재료 목록을 포함하는 ResponseEntity 객체를 반환합니다. 식재료 추천에 실패하면 에러 코드를 담은 *
     * ResponseEntity를 반환합니다.
     */
    @GetMapping("/recommends/ingredients")
    @Operation(summary = "식재료 추천", description = "ingredients와 많이 사용된 count 수 만큼 식재료 목록을 포함하는 ResponseEntity 객체를 반환합니다. 식재료 추천에 실패하면 에러 코드를 담은 ResponseEntity를 반환합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "추천 식재료 조회 성공"),
            @ApiResponse(responseCode = "204", description = "추천 식재료 조회 성공 - 추천 식재료가 없는 경우", content = @Content),
            @ApiResponse(responseCode = "404", description = "추천 식재료 조회 성공", content = @Content)
    })
    public ResponseEntity<ResponseDTO<?>> getRecommendIngredientList(
            @ModelAttribute RecommendIngredientListRequest dto) {

        List<RecommendIngredientListResponse> result = cartService.getRecommendIngredientList(dto);

        HttpStatus status = result.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK;

        return ResponseEntity.status(status).body(ResponseDTO.from(result));
    }
}
