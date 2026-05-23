package com.agriconnect.gateway.filter;

import com.agriconnect.gateway.security.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class AuthFilter extends
        AbstractGatewayFilterFactory<AuthFilter.Config> {

    private final JwtUtil jwtUtil;

    public AuthFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return rejectUnauthorized(exchange, "Missing Authorization header");
            }

            String authHeader = request.getHeaders()
                    .getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return rejectUnauthorized(exchange, "Invalid Authorization format");
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.isTokenValid(token)) {
                return rejectUnauthorized(exchange, "Invalid or expired JWT token");
            }

            Claims claims = jwtUtil.extractClaims(token);

            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Email", claims.getSubject())
                    .header("X-User-Id", claims.get("userId", String.class))
                    .header("X-User-Role", claims.get("role", String.class))
                    .build();

            log.debug("Request authorized for user: {}", claims.getSubject());

            return chain.filter(exchange.mutate()
                    .request(mutatedRequest)
                    .build());
        };
    }

    private Mono<Void> rejectUnauthorized(
            ServerWebExchange exchange, String reason) {

        log.warn("Unauthorized request rejected: {}", reason);
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }

    public static class Config {
        // Config class required by AbstractGatewayFilterFactory
        // Add per-route config options here later if needed
    }
}