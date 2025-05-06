# Stage 1: Solana image (only to get the Solana CLI)
FROM --platform=linux/amd64 solanalabs/solana:v1.17.16 as solana

# Stage 2: Your main dev environment
FROM --platform=linux/amd64 codercom/code-server:4.96.4

USER root

# Copy Solana CLI from the solana image to the current image
COPY --from=solana /usr/bin/solana /usr/local/bin/solana

# Install Node.js 22
RUN apt-get update \
    && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Rust and Cargo using rustup for root user
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:$PATH"

# Install Rust for coder user
USER coder
WORKDIR /home/coder
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/home/coder/.cargo/bin:$PATH"

# Make cargo available in PATH for both users
USER root
RUN echo 'source "$HOME/.cargo/env"' >> /root/.bashrc && \
    echo 'source "$HOME/.cargo/env"' >> /home/coder/.bashrc

# Install Rust tools and extensions
RUN code-server --install-extension rust-lang.rust-analyzer && \
    code-server --install-extension serayuzgur.crates && \
    code-server --install-extension tamasfe.even-better-toml

# Add comment about Solana CLI installation
# Solana CLI can also be installed manually after container startup if needed:
# $ sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
# $ export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Copy your project (assuming temp/bolty-worker is correct)
COPY temp/bolty-worker /home/coder/project
RUN chown -R coder:coder /home/coder/project

# Set Dark+ theme by default
RUN mkdir -p /home/coder/.local/share/code-server/User && \
    echo '{"workbench.colorTheme": "Dark+", "workbench.preferredDarkColorTheme": "Dark+"}' \
    > /home/coder/.local/share/code-server/User/settings.json \
    && chown -R coder:coder /home/coder/.local

# Switch to coder user
USER coder

# Expose necessary ports
EXPOSE 8080 8899 8900

# Start code-server
CMD ["code-server", "--auth", "none", "--bind-addr", "0.0.0.0:8080", "/home/coder/project"]
