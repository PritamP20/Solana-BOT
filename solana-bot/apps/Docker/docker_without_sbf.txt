# Stage 1: Solana CLI
FROM --platform=linux/amd64 solanalabs/solana:v1.18.18 AS solana

# Stage 2: Runtime stage with code-server
FROM --platform=linux/amd64 debian:bookworm-slim

# Set environment variables to minimize interaction and prevent unnecessary files
ENV DEBIAN_FRONTEND=noninteractive \
    PATH="/home/coder/.local/bin:/home/coder/.cargo/bin:/usr/local/bin:$PATH" \
    RUSTUP_HOME=/home/coder/.rustup \
    CARGO_HOME=/home/coder/.cargo

# Install minimal dependencies and setup in a single layer to reduce size
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    gcc \
    g++ \
    wget \
    libgcc-s1 \
    locales \
    dumb-init \
    sudo \
    xz-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    # Set up locale to en_US.UTF-8
    && sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
    && locale-gen \
    # Create coder user with sudo privileges
    && useradd -m -s /bin/bash -u 1000 coder \
    && echo "coder ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/nopasswd \
    # Create project directory
    && mkdir -p /home/coder/project \
    && chown -R coder:coder /home/coder

# Copy Solana CLI early to reduce layer size
COPY --from=solana /usr/bin/solana /usr/local/bin/solana

USER coder
WORKDIR /home/coder

# Create necessary directories
RUN mkdir -p $HOME/.local/bin $HOME/local/bin

# Install code-server
RUN curl -fsSL https://code-server.dev/install.sh | sh -s -- --method=standalone --version 4.99.4 \
    && rm -rf $HOME/.cache

# Install Node.js (minimal version)
RUN curl -fsSL https://nodejs.org/dist/v18.16.0/node-v18.16.0-linux-x64.tar.xz | \
    tar -xJ -C /tmp && \
    mkdir -p $HOME/.local && \
    mv /tmp/node-v18.16.0-linux-x64 $HOME/.local/node && \
    ln -s $HOME/.local/node/bin/node $HOME/.local/bin/node && \
    ln -s $HOME/.local/node/bin/npm $HOME/.local/bin/npm && \
    ln -s $HOME/.local/node/bin/npx $HOME/.local/bin/npx

# Install Rust with only necessary components
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable \
    && . $HOME/.cargo/env \
    && rustup target add x86_64-unknown-linux-gnu \
    # Clean up unnecessary Rust files
    && rm -rf $HOME/.rustup/toolchains/*/share/doc \
    && rm -rf $HOME/.cargo/registry/cache

# Set up compiler and environment
RUN echo '#!/bin/sh\nif ! which cc > /dev/null; then\n  ln -sf $(which gcc) ~/local/bin/cc\n  export PATH=~/local/bin:$PATH\nfi' > $HOME/setup_compiler.sh \
    && chmod +x $HOME/setup_compiler.sh \
    && echo '. $HOME/setup_compiler.sh' >> $HOME/.bashrc \
    && echo 'export PATH=$PATH:$HOME/.local/bin:$HOME/.cargo/bin' >> $HOME/.bashrc

# Create VS Code settings
RUN mkdir -p $HOME/.local/share/code-server/User \
    && echo '{"workbench.colorTheme":"Dark+","editor.fontSize":14,"terminal.integrated.fontSize":14}' > $HOME/.local/share/code-server/User/settings.json

# Install VS Code extensions
RUN $HOME/.local/bin/code-server --install-extension rust-lang.rust-analyzer \
    && rm -rf $HOME/.cache

# Clone project (sparse checkout to reduce size)
RUN git clone --depth 1 --filter=blob:none --sparse https://github.com/PritamP20/Solana-BOT.git /tmp/repo \
    && cd /tmp/repo \
    && git sparse-checkout set bolty-worker --no-cone \
    && mv bolty-worker /home/coder/project/ \
    && rm -rf /tmp/repo $HOME/.cache

# Install Node.js dependencies for primary-backen

# Return to home directory and verify installations
WORKDIR /home/coder
RUN . $HOME/.cargo/env && rustc --version && cargo --version && solana --version \
    && find $HOME -type d -name ".git" -exec rm -rf {} +; 2>/dev/null || true \
    && rm -rf $HOME/.npm $HOME/.cache

# Expose ports
EXPOSE 8080 8899 8900 3000

# Run code-server with dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/home/coder/.local/bin/code-server", "--auth", "none", "--bind-addr", "0.0.0.0:8080", "--disable-telemetry", "--disable-update-check", "/home/coder/project/bolty-worker"]