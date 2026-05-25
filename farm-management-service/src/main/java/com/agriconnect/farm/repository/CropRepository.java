package com.agriconnect.farm.repository;

import com.agriconnect.farm.document.Crop;
import com.agriconnect.farm.document.CropStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropRepository extends MongoRepository<Crop, String> {

    List<Crop> findByFarmId(String farmId);

    List<Crop> findByFarmerIdAndStatus(String farmerId, CropStatus status);

    List<Crop> findByFarmerId(String farmerId);
}