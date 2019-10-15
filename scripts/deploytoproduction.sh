#!/bin/bash
cd ~/Projects/TicketerProduction || exit
git pull
git checkout master
docker-compose -f docker-compose-production.yml up -d --build
