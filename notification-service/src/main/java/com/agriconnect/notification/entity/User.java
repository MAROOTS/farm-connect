package com.agriconnect.notification.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    private UUID id;

    private String email;
    private String fullName;
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private UserRole role;
}