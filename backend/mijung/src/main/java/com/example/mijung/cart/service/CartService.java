package com.example.mijung.cart.service;

import static com.example.mijung.cart.enums.CartMassage.INGREDIENTS_LESS_THAN_1;
import static com.example.mijung.ingredient.enums.IngredientMassage.INGREDIENT_NOT_FOUND;

import com.example.mijung.cart.dto.RecommendIngredientListRequest;
import com.example.mijung.cart.dto.RecommendIngredientListResponse;
import com.example.mijung.ingredient.repository.IngredientRepository;
import com.example.mijung.material.repository.MaterialRepository;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.ml.fpm.FPGrowthModel;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Encoders;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.functions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import scala.collection.JavaConverters;

@Service
@RequiredArgsConstructor
public class CartService {

    private final IngredientRepository ingredientRepository;
    private final FPGrowthModelService fpGrowthModelService;

    public List<RecommendIngredientListResponse> getRecommendIngredientList(RecommendIngredientListRequest dto) {
        List<Integer> inputIngredients = validateIngredients(dto.getIngredients());
        int count = dto.getCount();

        FPGrowthModel model = fpGrowthModelService.getModel();

        // 연관 규칙 생성
        Dataset<Row> associationRules = model.associationRules();

        // 입력된 재료와 관련된 규칙 필터링
        Dataset<Row> filteredRules = filterRulesByIngredients(associationRules, inputIngredients);

        // 중복 제거 후 신뢰도(confidence)를 기준으로 상위 규칙 선택
        List<Integer> mostAssociatedIngredients = getTopAssociatedIngredients(filteredRules, count);

        return getRecommendedIngredients(mostAssociatedIngredients);
    }

    private List<Integer> validateIngredients(List<Integer> inputIngredients) {
        List<Integer> uniqueIds = new HashSet<>(inputIngredients).stream().toList();

        if (uniqueIds.size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, INGREDIENTS_LESS_THAN_1.getMessage());
        }

        if(!ingredientRepository.existsByIdIn(uniqueIds)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, INGREDIENT_NOT_FOUND.getMessage());
        }

        return uniqueIds.stream().toList();
    }

    private Dataset<Row> filterRulesByIngredients(Dataset<Row> associationRules, List<Integer> ingredients) {
        for (Integer ingredient : ingredients) {
            associationRules = associationRules.filter(functions.array_contains(functions.col("antecedent"), ingredient));
        }

        return associationRules;
    }

    private List<Integer> getTopAssociatedIngredients(Dataset<Row> filteredRules, int count) {
        return filteredRules
                .select("consequent")
                .distinct()
                .orderBy(functions.desc("confidence")) // 신뢰도 기준으로 정렬
                .limit(count)
                .select(functions.explode(functions.col("consequent")).as("associated_ingredient"))
                .as(Encoders.INT())
                .collectAsList();
    }

    private List<RecommendIngredientListResponse> getRecommendedIngredients(List<Integer> mostAssociatedIngredients) {
        return mostAssociatedIngredients.stream()
                .map(itemId -> ingredientRepository.findById(itemId)
                        .map(RecommendIngredientListResponse::from)
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

}
