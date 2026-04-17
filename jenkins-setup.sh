#!/usr/bin/env sh

docker network create jenkins || true
docker volume create jenkins_home || true

docker run -d \
  --name jenkins \
  --restart unless-stopped \
  --network jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk17

echo "Get Jenkins initial password:"
echo "docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
echo "Open http://localhost:8080"
