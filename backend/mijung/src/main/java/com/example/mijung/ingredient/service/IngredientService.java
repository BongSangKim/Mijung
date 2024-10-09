package com.example.mijung.ingredient.service;

import static com.example.mijung.ingredient.enums.IngredientMassage.INGREDIENT_NOT_FOUND;

import com.example.mijung.common.dto.PaginationAndFilteringDto;
import com.example.mijung.common.dto.PaginationDTO;
import com.example.mijung.common.dto.RecipeListResponse;
import com.example.mijung.common.dto.ResponseDTO;
import com.example.mijung.ingredient.dto.*;
import com.example.mijung.ingredient.entity.*;
import com.example.mijung.ingredient.enums.IngredientMassage;
import com.example.mijung.ingredient.repository.IngredientCosineRepository;
import com.example.mijung.ingredient.repository.IngredientRepository;
import com.example.mijung.ingredient.repository.IngredientRepositoryCustom;
import com.example.mijung.recipe.entity.Recipe;
import com.example.mijung.recipe.repository.RecipeRepository;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final RecipeRepository recipeRepository;
    private final IngredientCosineRepository ingredientCosineRepository;
    private final IngredientRepositoryCustom ingredientRepositoryCustom;

    @Transactional
    public ResponseDTO<List<IngredientViewResponse>> getIngredientList(PaginationAndFilteringDto dto) {

        Pageable pageable = PageRequest.of(dto.getPage() - 1, dto.getPerPage());

        // DB에서 카테고리와 키워드에 맞는 식재료 데이터를 페이징하여 조회
        Page<Ingredient> ingredientsPage = ingredientRepository.findByItemCategoryCodeContainingAndItemNameContaining(
                resolveCategory(dto.getCategory()),
                resolveKeyword(dto.getKeyword()),
                pageable
        );

        List<IngredientViewResponse> data = new ArrayList<>();

        for (Ingredient ingredient : ingredientsPage.getContent()) {
            if (!ingredient.getIsPriced()) {
                data.add(IngredientViewResponse.of(ingredient));
            } else {
                IngredientInfo ingredientInfo = ingredient.getLatestIngredientInfo();
                IngredientRate ingredientRate = ingredient.getLatestIngredientRate();

                data.add(IngredientViewResponse.of(
                        ingredient,
                        ingredientInfo != null ? ingredientInfo.getPrice() : null,
                        ingredientRate != null ? ingredientRate.getWeekIncreaseRate() : null,
                        ingredientRate != null ? ingredientRate.getWeekIncreasePrice() : null
                ));
            }
        }
        // 페이지네이션 정보 생성
        PaginationDTO pagination = PaginationDTO.of(
                (int) ingredientsPage.getTotalElements(), dto.getPage(), dto.getPerPage()
        );

        // 데이터와 페이지네이션 정보를 담아 반환
        return ResponseDTO.of(data, pagination);
    }

    @Transactional
    public List<IngredientViewResponse> getIngredientSiseList(IngredientSiseRequest request) {
        if(!isValidIngredientRequest(request)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, INGREDIENT_NOT_FOUND.getMessage());
        }
        return ingredientRepositoryCustom.ingredientViewResponseList(request);

        /*
        * ingredient_id가 다른데 재료 이름이 같은 데이터가 있어서 임시방편으로 마련함.
        * 데이터가 완전해지면 위의 로직을 실행하면 됨
        * */
//        List<IngredientViewResponse> list = ingredientRepositoryCustom.ingredientViewResponseList(request);
//        if(list == null || list.isEmpty())
//        {
//            throw new ResponseStatusException(HttpStatus.NO_CONTENT, INGREDIENT_NOT_FOUND.getMessage());
//        }
//
//        List<IngredientViewResponse> result = new ArrayList<>();
//        Set<String> names = new HashSet<>();
//        int size = request.getCount();
//        for (IngredientViewResponse ingredient : list) {
//            if(result.size()==size) break;
//            if (names.contains(ingredient.getName())) continue;
//            names.add(ingredient.getName());
//            result.add(ingredient);
//        }
//        return result;
    }

    @Transactional
    public List<IngredientSearchResponse> getIngredientSearch(String search) {

        Pageable pageable = PageRequest.of(0, 5);

        Page<Ingredient> ingredientsPage = ingredientRepository.findByItemNameContaining(search,pageable);

        return ingredientsPage.getContent().stream()
                .map(ingredient -> IngredientSearchResponse.of(ingredient.getId(), ingredient.getItemName()))
                .collect(Collectors.toList());
    }

    @Transactional
    public IngredientInfoViewResponse getIngredientInfo(Integer ingredientId) {

        Ingredient ingredient = getIngredient(ingredientId);

        if(!ingredient.getIsPriced()){
            return IngredientInfoViewResponse.of(ingredient);
        }

        IngredientInfo ingredientInfo = ingredient.getLatestIngredientInfo();
        IngredientRate ingredientRate = ingredient.getLatestIngredientRate();

        return IngredientInfoViewResponse.of(ingredient, ingredientInfo, ingredientRate);
    }

    @Transactional
    public List<IngredientPriceGraphViewResponse> getIngredientPriceGraph(Integer ingredientId) {
        Ingredient ingredient = getIngredient(ingredientId);

        LocalDate today = LocalDate.now();
        LocalDate oneYearAgo = today.minusYears(1);
        LocalDate oneWeekLater = today.plusWeeks(1);

        List<IngredientInfo> infoList = ingredientRepository.findInfoByDateRange(ingredientId, oneYearAgo, today);
        List<IngredientPredict> predictList = ingredientRepository.findPredictByDateRange(ingredientId, oneYearAgo, oneWeekLater);


        Map<LocalDate, Integer> predictPriceMap = predictList.stream()
            .collect(Collectors.toMap(IngredientPredict::getDate, IngredientPredict::getPredictedPrice));

        List<IngredientPriceGraphViewResponse> result = infoList.stream()
            .map(info -> IngredientPriceGraphViewResponse.of(
                info.getDate(),
                info.getPrice(),
                predictPriceMap.getOrDefault(info.getDate(), null)
            ))
            .collect(Collectors.toList());


        predictList.stream()
            .filter(predict -> predict.getDate().isAfter(today))
            .forEach(predict -> result.add(IngredientPriceGraphViewResponse.of(
                predict.getDate(),
                null, // 미래 날짜의 실제 가격은 null
                predict.getPredictedPrice()
            )));

        return result;
    }


    @Transactional
    public List<RecipeListResponse> getIngredientRecommendRecipe(Integer ingredientId) {

        Ingredient ingredient = getIngredient(ingredientId);

        List<Recipe> recipes = recipeRepository.findByMaterialsIngredientId(ingredientId);

        List<Recipe> randomRecipes = getRandomRecipes(recipes);

        return convertToRecipeListResponse(randomRecipes);
    }

    public List<IngredientInfoViewResponse> getIngredientPrice(IngredientSiseRequest ingredientSiseRequest) {
        if(!isValidIngredientRequest(ingredientSiseRequest)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, INGREDIENT_NOT_FOUND.getMessage());
        }

        String period = ingredientSiseRequest.getPeriod();
        String change = ingredientSiseRequest.getChange();


        return null;
    }


    public Ingredient getIngredient(Integer ingredientId) {
        return ingredientRepository.findById(ingredientId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, INGREDIENT_NOT_FOUND.getMessage()));
    }

    private List<Recipe> getRandomRecipes(List<Recipe> recipes) {
        Collections.shuffle(recipes);
        return recipes.stream().limit(3).toList();
    }

    private List<RecipeListResponse> convertToRecipeListResponse(List<Recipe> recipes) {
        return recipes.stream()
                .map(RecipeListResponse::of)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<IngredientCosineResponse> getTopCosineIngredients(Integer ingredientId, int count) {
        Ingredient ingredient = getIngredient(ingredientId);

        Pageable pageable = PageRequest.of(0, count);
        List<IngredientCosine> cosines = ingredientCosineRepository.findByIngredientId1OrderByCosineDesc(ingredientId, pageable);

        return cosines.stream()
                .map(cosine -> {
                    Ingredient ingredient2 = getIngredient(cosine.getIngredientId2());

                    return IngredientCosineResponse.of(
                            cosine.getIngredientId2(),
                            ingredient2.getItemName(),
                            cosine.getCosine()
                    );
                })
                .collect(Collectors.toList());
    }

    private String resolveCategory(String category) {
        List<String> validCategories = Arrays.asList("100", "200", "300", "400", "500", "600", "700");
        if (category.equals("all")) {
            return "";
        }
        if (!validCategories.contains(category)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, IngredientMassage.CATEGORY_NOT_FOUND.getMessage());
        }
        return category;
    }

    private String resolveKeyword(String keyword) {
        // 키워드가 null이면 빈 문자열로 처리하여 모든 이름 조회
        return keyword == null ? "" : keyword;
    }


    public Boolean isValidIngredientRequest(IngredientSiseRequest ingredientSiseRequest) {
        if (ingredientSiseRequest == null) {
            return false;
        }
        if (ingredientSiseRequest.getPeriod() == null
            || ingredientSiseRequest.getChange() == null) {
            return false;
        }
        // Period 및 Change의 유효성 검사
        boolean isValidPeriod = Set.of("year", "week", "month")
            .contains(ingredientSiseRequest.getPeriod());
        boolean isValidChange = Set.of("positive", "negative")
            .contains(ingredientSiseRequest.getChange());

        return isValidPeriod && isValidChange;
    }
}
