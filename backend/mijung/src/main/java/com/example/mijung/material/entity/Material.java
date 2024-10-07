package com.example.mijung.material.entity;

import com.example.mijung.ingredient.entity.Ingredient;
import com.example.mijung.recipe.entity.Recipe;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Material {

  @Id
  @Column(name="material_id", updatable=false, nullable=false)
  private Integer id;

  @Column(updatable=false, nullable=false, columnDefinition = "TEXT")
  private String name;

  @Column(updatable = false, columnDefinition = "TEXT")
  private String capacity;

  @Column(updatable = false, nullable = false, columnDefinition = "TEXT")
  private String type;

  @Column(updatable = false, nullable = false)
  private Boolean analyzed;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="recipe_id", updatable = false, nullable = false)
  private Recipe recipe;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="ingredient_id", updatable = false)
  private Ingredient ingredient;
}
