FROM rust:1.90-slim AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/ship-it-rustgis /usr/local/bin/rustgis
EXPOSE 4100
CMD ["rustgis"]
