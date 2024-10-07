package com.example.mijung.cart.service;

import static org.apache.spark.sql.types.DataTypes.StringType;
import static org.apache.spark.sql.types.DataTypes.createArrayType;
import static org.apache.spark.sql.types.Metadata.empty;

import com.example.mijung.material.entity.Material;
import com.example.mijung.material.repository.MaterialRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.spark.ml.fpm.FPGrowth;
import org.apache.spark.ml.fpm.FPGrowthModel;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FPGrowthModelService {

    @Value("${fpgrowth.model.path}")
    private String modelPath;

    @Autowired
    private MaterialRepository materialRepository;

    private SparkSession sparkSession;
    private FPGrowthModel fpGrowthModel;

    @PostConstruct
    public void initialize() {
        try {
            this.sparkSession = SparkSession.builder()
                    .appName("IngredientRecommend")
                    .master("local[*]")
                    .getOrCreate();
        } catch (Exception e) {
            log.error("Failed to initialize SparkSession", e);
            throw new RuntimeException("Failed to initialize Spark", e);
        }

        if (modelExists()) {
            loadModel();
        } else {
            trainAndSaveModel();
        }
    }

    private boolean modelExists() {
        Path path = Paths.get(modelPath);
        return Files.exists(path);
    }

    private void loadModel() {
        try {
            fpGrowthModel = FPGrowthModel.load(modelPath);
            log.info("FPGrowth model loaded successfully.");
        } catch (Exception e) {
            log.error("Error loading FPGrowth model: {}", e.getMessage());
            trainAndSaveModel();
        }
    }

    private void trainAndSaveModel() {
        List<Material> allMaterials = materialRepository.findAll();
        Dataset<Row> transactions = convertToTransactions(allMaterials);

        fpGrowthModel = new FPGrowth()
                .setItemsCol("items")
                .setMinSupport(0.01)
                .setMinConfidence(0.5)
                .fit(transactions);

        try {
            fpGrowthModel.save(modelPath);
            System.out.println("FPGrowth model trained and saved successfully.");
        } catch (IOException e) {
            log.error("Error saving FPGrowth model: {}", e.getMessage());
        }
    }

    private Dataset<Row> convertToTransactions(List<Material> materials) {
        Map<Integer, List<Integer>> recipeIngredients = new HashMap<>();

        for (Material material : materials) {
            if (material.getIngredient() == null) {
                continue;
            }

            recipeIngredients
                    .computeIfAbsent(material.getRecipe().getId(), k -> new ArrayList<>())
                    .add(material.getIngredient().getId());
        }

        List<Row> rows = recipeIngredients.values().stream()
                .map(ingredients -> {
                    List<String> stringIngredients = ingredients.stream()
                            .distinct()
                            .map(String::valueOf)
                            .collect(Collectors.toList());
                    return org.apache.spark.sql.RowFactory.create((Object) stringIngredients);
                })
                .collect(Collectors.toList());

        return sparkSession.createDataFrame(rows, new StructType(
                new StructField[]{new StructField("items", createArrayType(StringType), false, empty())}));
    }

    public FPGrowthModel getModel() {
        return fpGrowthModel;
    }
}
