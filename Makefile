APP_NAME := law-assistant
APP_DIR := $(CURDIR)
SERVICE_USER ?= $(shell whoami)
RENDER_DIR := $(APP_DIR)/.systemd
BACKEND_SERVICE := $(APP_NAME)-backend.service
FRONTEND_SERVICE := $(APP_NAME)-frontend.service
SYSTEMD_DIR := /etc/systemd/system

.PHONY: help install install-backend install-frontend render-services install-services \
	enable-services disable-services start stop restart up down status logs backend-logs \
	frontend-logs daemon-reload

help:
	@printf "%s\n" \
	"make install           安装前后端依赖" \
	"make render-services   生成 systemd service 文件到 .systemd/" \
	"make install-services  安装 systemd service 文件" \
	"make up                安装并启动前后端服务" \
	"make down              停止前后端服务" \
	"make restart           重启前后端服务" \
	"make status            查看前后端服务状态" \
	"make logs              查看前后端服务日志"

install: install-backend install-frontend

install-backend:
	python3 -m pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

render-services:
	bash scripts/render_systemd.sh "$(APP_DIR)" "$(SERVICE_USER)" "$(RENDER_DIR)"

install-services: render-services
	sudo cp "$(RENDER_DIR)/$(BACKEND_SERVICE)" "$(SYSTEMD_DIR)/$(BACKEND_SERVICE)"
	sudo cp "$(RENDER_DIR)/$(FRONTEND_SERVICE)" "$(SYSTEMD_DIR)/$(FRONTEND_SERVICE)"
	$(MAKE) daemon-reload

daemon-reload:
	sudo systemctl daemon-reload

enable-services:
	sudo systemctl enable "$(BACKEND_SERVICE)" "$(FRONTEND_SERVICE)"

disable-services:
	sudo systemctl disable "$(BACKEND_SERVICE)" "$(FRONTEND_SERVICE)"

start:
	sudo systemctl start "$(BACKEND_SERVICE)" "$(FRONTEND_SERVICE)"

stop:
	sudo systemctl stop "$(BACKEND_SERVICE)" "$(FRONTEND_SERVICE)"

restart:
	sudo systemctl restart "$(BACKEND_SERVICE)" "$(FRONTEND_SERVICE)"

up: install install-services enable-services start

down: stop

status:
	sudo systemctl status "$(BACKEND_SERVICE)" "$(FRONTEND_SERVICE)" --no-pager

logs:
	sudo journalctl -u "$(BACKEND_SERVICE)" -u "$(FRONTEND_SERVICE)" -f

backend-logs:
	sudo journalctl -u "$(BACKEND_SERVICE)" -f

frontend-logs:
	sudo journalctl -u "$(FRONTEND_SERVICE)" -f
