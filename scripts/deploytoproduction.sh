#!/bin/bash
cd ~/Projects/TicketerProduction || exit
git pull
git checkout master
docker-compose up -d --build
