package com.agriconnect.farm.repository;

import com.agriconnect.farm.document.Farm;
import com.agriconnect.farm.document.FarmStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FarmRepository extends MongoRepository<Farm, String> {

    Optional<Farm> findByFarmerId(String farmerId);

    boolean existsByFarmerId(String farmerId);

    List<Farm> findByStatus(FarmStatus status);
}