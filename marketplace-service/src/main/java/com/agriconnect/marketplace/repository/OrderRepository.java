package com.agriconnect.marketplace.repository;

import com.agriconnect.marketplace.entity.Order;
import com.agriconnect.marketplace.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByBuyerId(String buyerId);

    List<Order> findByBuyerIdAndStatus(String buyerId, OrderStatus status);
}