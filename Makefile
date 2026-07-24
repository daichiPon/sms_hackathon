COMPOSE := docker compose

.PHONY: up down logs status

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f app

status:
	$(COMPOSE) ps
