package com.example.mijung.ingredient.repository;


import com.example.mijung.ingredient.entity.IngredientCosine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IngredientCosineRepository extends JpaRepository<IngredientCosine, Integer> {
    // ingredientId1을 기준으로 cosine 값 상위 100개의 데이터 조회
    List<IngredientCosine> findTop100ByIngredientId1OrderByCosineDesc(Integer ingredientId1);
}