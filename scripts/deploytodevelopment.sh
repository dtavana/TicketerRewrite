#!/bin/bash
cd ~/Projects/TicketerDevelopment || exit
git pull
git checkout develop
docker-compose -f docker-compose-development.yml up -d --build
