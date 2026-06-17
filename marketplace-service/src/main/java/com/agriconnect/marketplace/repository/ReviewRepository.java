package com.agriconnect.marketplace.repository;

import com.agriconnect.marketplace.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    boolean existsByOrderId(UUID orderId);

    List<Review> findByFarmerId(String farmerId);

    List<Review> findByListingId(UUID listingId);

    @Query("select avg(r.rating) from Review r where r.farmerId = :farmerId")
    Double findAverageRatingByFarmerId(@Param("farmerId") String farmerId);

    long countByFarmerId(String farmerId);
}