package com.agriconnect.farm.repository;

import com.agriconnect.farm.document.FarmTask;
import com.agriconnect.farm.document.TaskStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FarmTaskRepository extends MongoRepository<FarmTask, String> {

    List<FarmTask> findByFarmerId(String farmerId);

    List<FarmTask> findByFarmId(String farmId);

    List<FarmTask> findByFarmerIdAndStatus(String farmerId, TaskStatus status);

    // Find overdue tasks — due before today and not yet completed
    List<FarmTask> findByFarmerIdAndDueDateBeforeAndStatusNot(
            String farmerId, LocalDate date, TaskStatus status);
}