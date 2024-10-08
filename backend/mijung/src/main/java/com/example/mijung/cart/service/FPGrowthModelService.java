package com.example.mijung.cart.service;

import static org.apache.spark.sql.types.DataTypes.IntegerType;
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
        this.sparkSession = createSparkSession();

        if (modelExists()) {
            loadModel();
        } else {
            trainAndSaveModel();
        }
    }

    private SparkSession createSparkSession() {
        if(sparkSession == null){
            sparkSession = SparkSession.builder()
                    .appName("IngredientRecommend")
                    .master("local[*]") // #spark://3.35.55.230:7077
                    .getOrCreate();
        }

        return sparkSession;
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

        saveModel();
    }

    private void saveModel() {
        try {
            fpGrowthModel.write().overwrite().save(modelPath);
            log.info("FPGrowth model trained and saved successfully.");
        } catch (IOException e) {
            log.error("Error saving FPGrowth model: {}", e.getMessage());
        }
    }

    private Dataset<Row> convertToTransactions(List<Material> materials) {
        Map<Integer, List<Integer>> recipeIngredients = materials.stream()
                .filter(material -> material.getIngredient() != null)
                .collect(Collectors.groupingBy(
                        material -> material.getRecipe().getId(),
                        Collectors.mapping(material -> material.getIngredient().getId(), Collectors.toList())
                ));

        List<Row> rows = recipeIngredients.values().stream()
                .map(ingredients -> org.apache.spark.sql.RowFactory.create((Object) ingredients.stream()
                        .distinct()
                        .toArray(Integer[]::new)))
                .collect(Collectors.toList());

        return sparkSession.createDataFrame(rows, new StructType(
                new StructField[]{new StructField("items", createArrayType(IntegerType), false, empty())}));
    }

    public FPGrowthModel getModel() {
        return fpGrowthModel;
    }
}
