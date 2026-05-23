package com.agriconnect.marketplace.repository;

import com.agriconnect.marketplace.entity.Listing;
import com.agriconnect.marketplace.entity.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {

    List<Listing> findByStatus(ListingStatus status);

    List<Listing> findByFarmerIdAndStatus(String farmerId, ListingStatus status);

    List<Listing> findByCategoryAndStatus(String category, ListingStatus status);
}