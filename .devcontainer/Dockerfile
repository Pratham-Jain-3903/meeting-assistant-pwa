# Use Ubuntu 22.04 as base image
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=development

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Python 3.11 and pip
    python3.11 \
    python3.11-dev \
    python3.11-venv \
    python3-pip \
    # Node.js 18
    curl \
    ca-certificates \
    gnupg \
    # Audio processing dependencies
    ffmpeg \
    libsndfile1-dev \
    libasound2-dev \
    portaudio19-dev \
    # Build tools
    build-essential \
    cmake \
    pkg-config \
    # Additional utilities
    wget \
    git \
    vim \
    nano \
    htop \
    tree \
    jq \
    sudo \
    # Clean up
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Create vscode user
RUN groupadd --gid 1000 vscode \
    && useradd --uid 1000 --gid vscode --shell /bin/bash --create-home vscode \
    && echo 'vscode ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers.d/vscode \
    && chmod 0440 /etc/sudoers.d/vscode

# Set up Python alternatives
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1 \
    && update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1

# Install global Node.js packages
RUN npm install -g \
    @next/codemod \
    create-next-app \
    typescript \
    tsx \
    nodemon \
    pm2 \
    vercel \
    netlify-cli

# Install Python packages for AI/ML
COPY requirements-dev.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements-dev.txt

# Install PyTorch with CPU support (for development)
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install additional Python packages for development
RUN pip install --no-cache-dir \
    # Development tools
    black \
    isort \
    flake8 \
    mypy \
    pytest \
    pytest-asyncio \
    pytest-cov \
    # Jupyter and data science
    jupyter \
    jupyterlab \
    notebook \
    ipywidgets \
    matplotlib \
    seaborn \
    plotly \
    # Database and ORM
    alembic \
    # API documentation
    mkdocs \
    mkdocs-material

# Create workspace directory and set permissions
RUN mkdir -p /workspace && chown vscode:vscode /workspace

# Copy and set permissions for devcontainer scripts
COPY --chown=vscode:vscode post-create.sh /workspace/.devcontainer/
COPY --chown=vscode:vscode post-start.sh /workspace/.devcontainer/
COPY --chown=vscode:vscode install-deps.sh /workspace/.devcontainer/
COPY --chown=vscode:vscode format-code.sh /workspace/.devcontainer/
COPY --chown=vscode:vscode run-tests.sh /workspace/.devcontainer/
RUN chmod +x /workspace/.devcontainer/*.sh

# Set up Git configuration template
RUN git config --global init.defaultBranch main \
    && git config --global pull.rebase false \
    && git config --global user.name "Dev Container User" \
    && git config --global user.email "dev@example.com"

# Create data directories
RUN mkdir -p /workspace/data/uploads \
    && mkdir -p /workspace/data/models \
    && mkdir -p /workspace/data/db \
    && chown -R vscode:vscode /workspace/data

# Switch to vscode user
USER vscode

# Set up shell environment
RUN echo 'export PATH="$PATH:/home/vscode/.local/bin"' >> /home/vscode/.bashrc \
    && echo 'export PYTHONPATH="/workspace/backend:$PYTHONPATH"' >> /home/vscode/.bashrc \
    && echo 'alias ll="ls -la"' >> /home/vscode/.bashrc \
    && echo 'alias la="ls -la"' >> /home/vscode/.bashrc \
    && echo 'alias ..="cd .."' >> /home/vscode/.bashrc \
    && echo 'alias ...="cd ../.."' >> /home/vscode/.bashrc

# Set up ZSH if installed
RUN if [ -f /home/vscode/.zshrc ]; then \
        echo 'export PATH="$PATH:/home/vscode/.local/bin"' >> /home/vscode/.zshrc && \
        echo 'export PYTHONPATH="/workspace/backend:$PYTHONPATH"' >> /home/vscode/.zshrc && \
        echo 'alias ll="ls -la"' >> /home/vscode/.zshrc && \
        echo 'alias la="ls -la"' >> /home/vscode/.zshrc && \
        echo 'alias ..="cd .."' >> /home/vscode/.zshrc && \
        echo 'alias ...="cd ../.."' >> /home/vscode/.zshrc; \
    fi

# Set working directory
WORKDIR /workspace

# Expose ports
EXPOSE 3000 8000 8888
