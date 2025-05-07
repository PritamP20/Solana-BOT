#!/bin/bash
cargo build-sbf --manifest-path=./Cargo.toml
solana program deploy ./target/deploy/solana_chess.so --url devnet
