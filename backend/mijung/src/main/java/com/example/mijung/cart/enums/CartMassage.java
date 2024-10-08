package com.example.mijung.cart.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum CartMassage {
    INGREDIENTS_LESS_THAN_1("ingredients must be greater than 1.");
    private final String message;
}
