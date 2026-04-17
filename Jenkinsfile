pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        APP_NAME = 'appointment-scheduler'
        REPO_URL = 'https://github.com/HEMAVATHI2809/devops_proj.git'
        COMPOSE_FILE = 'docker-compose.yml'
        FRONTEND_IMAGE = 'appointment-frontend:latest'
        BACKEND_IMAGE = 'appointment-backend:latest'
        FRONTEND_PORT = '3000'
        BACKEND_PORT = '5000'
        MONGO_PORT = '27017'
    }

    stages {
        stage('Checkout') {
            steps {
                cleanWs()
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh '''
                    docker run --rm -v "$PWD/backend:/app" -w /app node:18-alpine sh -lc '
                      if [ -f package-lock.json ]; then
                        npm ci
                      else
                        npm install
                      fi
                    '
                '''
                sh '''
                    docker run --rm -v "$PWD/frontend:/app" -w /app node:18-alpine sh -lc '
                      if [ -f package-lock.json ]; then
                        npm ci
                      else
                        npm install
                      fi
                      npm run build
                    '
                '''
            }
        }

        stage('Test') {
            steps {
                sh 'echo "Running basic placeholder tests..."'
                sh 'docker run --rm -v "$PWD/backend:/app" -w /app node:18-alpine sh -lc "node -e \\"console.log(\'Backend placeholder test passed\')\\""'
                sh 'docker run --rm -v "$PWD/frontend:/app" -w /app node:18-alpine sh -lc "node -e \\"console.log(\'Frontend placeholder test passed\')\\""'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t $FRONTEND_IMAGE ./frontend'
                sh 'docker build -t $BACKEND_IMAGE ./backend'
            }
        }

        stage('Docker Compose Up') {
            steps {
                sh 'docker compose -f $COMPOSE_FILE down || true'
                sh 'docker compose -f $COMPOSE_FILE up -d --build'
                sh 'docker compose -f $COMPOSE_FILE ps'
            }
        }
    }

    post {
        success {
            echo "SUCCESS: ${APP_NAME} deployed successfully on ports ${FRONTEND_PORT}/${BACKEND_PORT}/${MONGO_PORT}"
        }
        failure {
            echo "FAILURE: Pipeline failed. Check Jenkins console output."
        }
        always {
            sh 'docker image prune -f || true'
            cleanWs(deleteDirs: true, notFailBuild: true)
        }
    }
}
