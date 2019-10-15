#!/bin/bash
cd ~/Projects/TicketerDevelopment || exit
git pull
git checkout develop
docker-compose up -d --build
