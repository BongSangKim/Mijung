package com.example.mijung.ingredient.repository;

import com.example.mijung.ingredient.entity.Ingredient;
import com.example.mijung.ingredient.entity.IngredientInfo;
import com.example.mijung.ingredient.entity.IngredientPredict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Integer> {
    Page<Ingredient> findByItemCategoryCodeContainingAndItemNameContaining(String category, String keyword, Pageable pageable);
    Page<Ingredient> findByItemNameContaining(String keyword, Pageable pageable);
    @Query("SELECT i FROM IngredientInfo i WHERE i.ingredient.id = :ingredientId AND i.date BETWEEN :oneYearAgo AND :today")
    List<IngredientInfo> findInfoByDateRange(Integer ingredientId, LocalDate oneYearAgo, LocalDate today);
    @Query("SELECT p FROM IngredientPredict p WHERE p.ingredient.id = :ingredientId AND p.date BETWEEN :today AND :oneWeekLater")
    List<IngredientPredict> findPredictByDateRange(Integer ingredientId, LocalDate today, LocalDate oneWeekLater);

    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM Ingredient i WHERE i.id IN :ids")
    boolean existsByIdIn(@Param("ids") List<Integer> ids);
}
