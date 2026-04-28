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
        FRONTEND_IMAGE = 'appointment-frontend'
        BACKEND_IMAGE = 'appointment-backend'
        FRONTEND_PORT = '3001'
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
                sh 'docker build --target build -t appointment-frontend-build:latest ./frontend'
                sh 'docker build -t appointment-backend-build:latest ./backend'
            }
        }

        stage('Test') {
            steps {
                sh 'echo "Running basic placeholder tests..."'
                sh 'echo "Backend placeholder test passed"'
                sh 'echo "Frontend placeholder test passed"'
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
                sh '''
                    CONTAINERS_ON_FRONTEND_PORT=$(docker ps --filter "publish=${FRONTEND_PORT}" -q)
                    if [ -n "$CONTAINERS_ON_FRONTEND_PORT" ]; then
                      echo "Releasing port ${FRONTEND_PORT} from existing containers..."
                      docker stop $CONTAINERS_ON_FRONTEND_PORT || true
                      docker rm $CONTAINERS_ON_FRONTEND_PORT || true
                    fi
                '''
                sh 'docker compose -f $COMPOSE_FILE up -d'
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
