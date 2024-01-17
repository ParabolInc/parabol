.PHONY: all clone build install

# Default target
all: build

# Target for handling the pgvector repository
clone:
	if [ ! -d "pgvector" ]; then \
		git clone https://github.com/ankane/pgvector.git; \
	else \
		cd pgvector && git pull; \
	fi

# Target for building pgvector
build: clone
	cd pgvector && make

# Target for installing pgvector
install: build
	cd pgvector && make install
