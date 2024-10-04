package com.example.mijung.ingredient.repository;


import com.example.mijung.ingredient.entity.IngredientCosine;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IngredientCosineRepository extends JpaRepository<IngredientCosine, Integer> {
    List<IngredientCosine> findByIngredientId1OrderByCosineDesc(Integer ingredientId1, Pageable pageable);
}