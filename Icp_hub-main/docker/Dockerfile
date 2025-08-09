FROM ubuntu:22.04

# Set up environment variables
ENV NVM_DIR=/root/.nvm
ENV NODE_VERSION=18
ENV PATH="/root/.cargo/bin:${PATH}"
ENV DFX_VERSION=0.28.0
ENV DFX_NON_INTERACTIVE=true

# Install prerequisites
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    libssl-dev \
    openssl \
    git \
    vim \
    ca-certificates \
    cmake \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install NVM and Node.js
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash && \
    . $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm use $NODE_VERSION && \
    nvm alias default $NODE_VERSION

# Add node and npm to path so the commands are available
ENV NODE_PATH=$NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Install Rust (needed for some DFX dependencies)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Install DFX manually instead of using the interactive installer
RUN mkdir -p /root/.local/share/dfx/bin && \
    cd /tmp && \
    curl -fsSL https://github.com/dfinity/sdk/releases/download/0.28.0/dfx-0.28.0-x86_64-linux.tar.gz -o dfx.tar.gz && \
    tar -xzf dfx.tar.gz && \
    mv dfx /root/.local/share/dfx/bin && \
    chmod +x /root/.local/share/dfx/bin/dfx

# Add dfx to PATH
ENV PATH="/root/.local/share/dfx/bin:${PATH}"

# Create app directory
WORKDIR /app

# Copy project files (relative to parent directory)
COPY .. /app

# Expose DFX port
EXPOSE 4943

# Copy and set entrypoint
COPY ./docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
