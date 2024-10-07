package com.example.mijung.cart.service;

import com.example.mijung.cart.dto.RecommendIngredientListRequest;
import com.example.mijung.cart.dto.RecommendIngredientListResponse;
import com.example.mijung.ingredient.repository.IngredientRepository;
import com.example.mijung.material.repository.MaterialRepository;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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
import org.springframework.stereotype.Service;
import scala.collection.JavaConverters;

@Service
@RequiredArgsConstructor
public class CartService {

    private final IngredientRepository ingredientRepository;
    private final FPGrowthModelService fpGrowthModelService;

    public List<RecommendIngredientListResponse> getRecommendIngredientList(RecommendIngredientListRequest dto) {
        List<Integer> inputIngredients = dto.getIngredients();
        int count = dto.getCount();

        List<RecommendIngredientListResponse> data = new ArrayList<>();

        FPGrowthModel model = fpGrowthModelService.getModel();

        // 연관 규칙 생성
        Dataset<Row> associationRules = model.associationRules();

        // 입력된 재료와 관련된 규칙 필터링
        Dataset<Row> filteredRules = associationRules.filter(
                functions.array_contains(functions.col("antecedent"), String.valueOf(inputIngredients.get(0))));
        for (int i = 1; i < inputIngredients.size(); i++) {
            filteredRules = filteredRules.filter(
                    functions.array_contains(functions.col("antecedent"), String.valueOf(inputIngredients.get(i))));
        }

        Dataset<Row> topRules = filteredRules
                .select("consequent")
                .distinct()
                .orderBy(functions.desc("confidence")) // 신뢰도 기준으로 정렬
                .limit(count);

        // 결과에서 consequent 추출
        List<String> mostAssociatedIngredients = topRules.select(
                        functions.explode(functions.col("consequent")).as("associated_ingredient"))
                .select("associated_ingredient")
                .as(Encoders.STRING())
                .collectAsList();

        for (String itemId : mostAssociatedIngredients) {
            ingredientRepository.findById(Integer.parseInt(itemId))
                    .ifPresent(ingredient -> data.add(RecommendIngredientListResponse.from(ingredient)));
        }

        return data;
    }

}
