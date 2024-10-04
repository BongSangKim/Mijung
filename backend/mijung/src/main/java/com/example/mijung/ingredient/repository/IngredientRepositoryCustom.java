package com.example.mijung.ingredient.repository;

import com.example.mijung.ingredient.dto.IngredientInfoViewResponse;
import com.example.mijung.ingredient.dto.IngredientSiseRequest;
import com.example.mijung.ingredient.entity.Ingredient;
import com.example.mijung.ingredient.entity.QIngredient;
import com.example.mijung.ingredient.entity.QIngredientInfo;
import com.example.mijung.ingredient.entity.QIngredientRate;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class IngredientRepositoryCustom {

  private final JPAQueryFactory queryFactory;

  public List<IngredientInfoViewResponse> ingredientInfoViewResponseList(
      IngredientSiseRequest ingredientSiseRequest) {

    String period = ingredientSiseRequest.getPeriod();
    String change = ingredientSiseRequest.getChange();
    Integer count = ingredientSiseRequest.getCount();
    QIngredient ingredient = QIngredient.ingredient;
    QIngredientInfo ingredientInfo = QIngredientInfo.ingredientInfo;
    QIngredientRate ingredientRate = QIngredientRate.ingredientRate;

    List<Tuple> results = queryFactory
        .select(
            ingredient,             //수정중
            ingredientInfo.price,
            getRateField(period, ingredientRate),
            getPriceField(period, ingredientRate)
        )
        .from(ingredient)
        .join(ingredientInfo).on(ingredient.id.eq(ingredientInfo.ingredient.id))
        .join(ingredientRate).on(ingredient.id.eq(ingredientRate.ingredient.id))
        .where(ingredient.isPriced.isTrue())
        .where(ingredientInfo.date.eq(
            JPAExpressions.select(ingredientInfo.date.max())
                .from(ingredientInfo)
        ))
        .where(ingredientRate.date.eq(
            JPAExpressions.select(ingredientRate.date.max())
                .from(ingredientRate)
        ))
        .where(getRateCondition(period, change, ingredientRate))
        .orderBy(getRateField(period, ingredientRate).abs().desc())
        .limit(count+3)
        .fetch();

    return results.stream()
        .map(this::mapToIngredientInfoViewResponse)
        .collect(Collectors.toList());
  }

  private IngredientInfoViewResponse mapToIngredientInfoViewResponse(Tuple tuple) {
    Ingredient ingredient = tuple.get(0, Ingredient.class);
    Integer price = tuple.get(1, Integer.class);
    Float changeRate = tuple.get(2, Float.class);
    Integer changePrice = tuple.get(3, Integer.class);
    // null 체크 추가
    if (ingredient == null) {
      return null;  // 또는 로그를 남기고 null 반환
    }
    return IngredientInfoViewResponse.of(ingredient, price, changeRate, changePrice);
  }

  private NumberExpression<Integer> getPriceField(String period, QIngredientRate ingredientRate) {
    return switch (Optional.ofNullable(period).orElse("").toLowerCase()) {
      case "year" -> ingredientRate.yearIncreasePrice;
      case "month" -> ingredientRate.monthIncreasePrice;
      case "week" -> ingredientRate.weekIncreasePrice;
      default -> throw new IllegalArgumentException("Invalid period specified");
    };
  }

  private NumberExpression<Float> getRateField(String period, QIngredientRate ingredientRate) {
    return switch (Optional.ofNullable(period).orElse("").toLowerCase()) {
      case "year" -> ingredientRate.yearIncreaseRate;
      case "month" -> ingredientRate.monthIncreaseRate;
      case "week" -> ingredientRate.weekIncreaseRate;
      default -> throw new IllegalArgumentException("Invalid period specified");
    };
  }

  private BooleanExpression getRateCondition(String period, String change,
      QIngredientRate ingredientRate) {
    NumberExpression<Float> rateField = getRateField(period, ingredientRate);

    return switch (Optional.ofNullable(change).orElse("").toLowerCase()) {
      case "positive" -> rateField.goe(0);
      case "negative" -> rateField.lt(0);
      default -> null;  // 모든 변동률 포함
    };
  }
}