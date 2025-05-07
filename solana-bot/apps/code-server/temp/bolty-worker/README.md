# Solana Chess Contract

A fully on-chain chess game built on Solana blockchain. This contract handles game state, moves, and game logic directly on-chain.

## Features

- Initialize new chess games between two players
- Make moves with full chess rule validation
- Support for special moves (castling, en passant, promotion)
- Resign and draw functionality
- Complete move history tracking
- Check and checkmate detection

## Technical Implementation

The contract is written in Rust using the Solana Program framework and Borsh for serialization. The game state is stored in a Solana account, and all game logic is executed on-chain.

## Getting Started

### Prerequisites

- Rust and Cargo
- Solana CLI
- Bun (for running tests)

### Installation

1. Clone this repository
```
git clone <repository-url>
```

2. Build the program
```
cargo build-sbf
```

3. Deploy to a Solana cluster
```
solana program deploy ./target/deploy/solana_program.so
```

### Testing

Run the tests using Bun:
```
bun test
```

## How It Works

1. **Game Initialization**: A new game is created with two players (white and black)
2. **Making Moves**: Players take turns making moves, with full validation of chess rules
3. **Game Resolution**: Games can end in checkmate, resignation, or draw

## Contract Structure

- `lib.rs`: Main contract code with game logic
- `index.test.ts`: JavaScript tests for the contract

## Inspired By

This implementation is inspired by existing Solana chess projects like:
- [sol-chess](https://github.com/thom-gg/solachess) - An on-chain chess application using Anchor framework
- [Solana Unity Chess](https://github.com/magicblock-labs/Solana-Unity-Chess) - A 3D chess game built with Unity and Solana

## License

This project is licensed under the MIT License.
  