COMPOSE := docker compose

.PHONY: up down logs ps build clean

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f frontend backend

ps:
	$(COMPOSE) ps

build:
	$(COMPOSE) build

clean:
	$(COMPOSE) down --volumes --remove-orphans
