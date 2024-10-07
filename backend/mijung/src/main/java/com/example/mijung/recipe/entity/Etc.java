package com.example.mijung.recipe.entity;

import javax.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Etc {
    @Id
    @Column(name = "etc_id", updatable = false, nullable = false)
    private Integer id;

    @Column(nullable = false,columnDefinition = "TEXT")
    private String name;

    @Column(columnDefinition = "TEXT")
    private String capacity;

    @Column(nullable = false,columnDefinition = "TEXT")
    private String type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;
}