# Stage 1: Solana image (only to get the Solana CLI)
FROM --platform=linux/amd64 solanalabs/solana:v1.18.18 as solana

# Stage 2: Your main dev environment
FROM --platform=linux/amd64 codercom/code-server:4.96.4

USER root

# Copy Solana CLI from the solana image to the current image
COPY --from=solana /usr/bin/solana /usr/local/bin/solana

# Install Node.js 22, unzip, and other dependencies
RUN apt-get update \
    && apt-get install -y curl unzip build-essential pkg-config libssl-dev libudev-dev \
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

# Install Solana tools
RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)" \
    && export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH" \
    && echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc

# Install Bun for coder user
RUN curl -fsSL https://bun.sh/install | bash \
    && echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc

# Make cargo available in PATH for both users
USER root
RUN echo 'source "$HOME/.cargo/env"' >> /root/.bashrc && \
    echo 'source "$HOME/.cargo/env"' >> /home/coder/.bashrc

# Create local bin directory for fallback compiler setup (if needed)
RUN mkdir -p /home/coder/local/bin && \
    chown -R coder:coder /home/coder/local

# Add fallback compiler setup script
RUN echo '#!/bin/bash\n\
if ! which cc > /dev/null; then\n\
  mkdir -p ~/local/bin\n\
  if which gcc > /dev/null; then\n\
    ln -sf $(which gcc) ~/local/bin/cc\n\
  elif which clang > /dev/null; then\n\
    ln -sf $(which clang) ~/local/bin/cc\n\
  fi\n\
  export PATH=~/local/bin:$PATH\n\
  echo "Created cc symlink in ~/local/bin"\n\
fi\n\
' > /home/coder/setup_compiler.sh && \
    chmod +x /home/coder/setup_compiler.sh && \
    chown coder:coder /home/coder/setup_compiler.sh

# Add script to .bashrc to run at login
RUN echo 'source ~/setup_compiler.sh' >> /home/coder/.bashrc

# Install Rust tools and extensions
RUN code-server --install-extension rust-lang.rust-analyzer && \
    code-server --install-extension serayuzgur.crates && \
    code-server --install-extension tamasfe.even-better-toml

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