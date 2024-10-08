package com.example.mijung.cart.service;

import static com.example.mijung.cart.enums.CartMassage.INGREDIENTS_LESS_THAN_1;
import static com.example.mijung.ingredient.enums.IngredientMassage.INGREDIENT_NOT_FOUND;

import com.example.mijung.cart.dto.RecommendIngredientListRequest;
import com.example.mijung.cart.dto.RecommendIngredientListResponse;
import com.example.mijung.ingredient.entity.Ingredient;
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
import org.apache.spark.sql.Column;
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
        Dataset<Row> associationRules = model.associationRules().cache();

        // 입력된 재료와 관련된 규칙 필터링
        Dataset<Row> filteredRules = filterRulesByIngredients(associationRules, inputIngredients);

        // 중복 제거 후 신뢰도(confidence)를 기준으로 상위 규칙 선택
        List<Integer> mostAssociatedIngredients = getTopAssociatedIngredients(filteredRules, count);

        return getRecommendedIngredients(mostAssociatedIngredients);
    }

    private List<Integer> validateIngredients(List<Integer> inputIngredients) {
        List<Integer> uniqueIds = new HashSet<>(inputIngredients).stream().toList();

        if(!ingredientRepository.existsByIdIn(uniqueIds)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, INGREDIENT_NOT_FOUND.getMessage());
        }

        return uniqueIds;
    }

    private Dataset<Row> filterRulesByIngredients(Dataset<Row> associationRules, List<Integer> ingredients) {
        Column ingredientsArray = functions.array(ingredients.stream().map(functions::lit).toArray(Column[]::new));

        Column condition = functions.expr("size(filter(antecedent, x -> array_contains(" + ingredientsArray + ", x))) = " + ingredients.size());

        return associationRules.filter(condition);
    }

    private List<Integer> getTopAssociatedIngredients(Dataset<Row> filteredRules, int count) {
        return filteredRules
                .groupBy("consequent")
                .agg(functions.max("confidence").as("max_confidence"))
                .orderBy(functions.desc("max_confidence"))
                .limit(count)
                .select(functions.explode(functions.col("consequent")).as("associated_ingredient"))
                .as(Encoders.INT())
                .collectAsList();
    }

    private List<RecommendIngredientListResponse> getRecommendedIngredients(List<Integer> mostAssociatedIngredients) {
        List<Ingredient> ingredients = ingredientRepository.findAllById(mostAssociatedIngredients);
        return ingredients.stream()
                .map(RecommendIngredientListResponse::from)
                .collect(Collectors.toList());
    }

}
