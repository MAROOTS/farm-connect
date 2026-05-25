package com.agriconnect.farm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing   // enables @CreatedDate and @LastModifiedDate
public class MongoConfig {
}