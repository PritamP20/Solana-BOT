FROM codercom/code-server:4.96.4

USER root

# Install Node.js 22
RUN apt-get update \
    && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# ✅ Install Rust and Cargo using rustup
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y \
    && echo 'source $HOME/.cargo/env' >> /etc/profile \
    && echo 'source $HOME/.cargo/env' >> /home/coder/.bashrc

# Make sure Rust is available for all users
ENV PATH="/root/.cargo/bin:/home/coder/.cargo/bin:${PATH}"

# Copy your project
COPY temp/bolty-worker /home/coder/project
RUN chown -R coder:coder /home/coder/project

# Set Dark+ theme by default
RUN mkdir -p /home/coder/.local/share/code-server/User && \
    echo '{"workbench.colorTheme": "Dark+", "workbench.preferredDarkColorTheme": "Dark+"}' \
    > /home/coder/.local/share/code-server/User/settings.json \
    && chown -R coder:coder /home/coder/.local

USER coder

EXPOSE 8080

CMD ["code-server", "--auth", "none", "--bind-addr", "0.0.0.0:8080", "/home/coder/project"]
