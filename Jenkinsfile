
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'isats-app'
        CONTAINER_NAME = 'isats-container'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Downloading ISATS source code'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build Frontend') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE_NAME%:latest .'
            }
        }

        stage('Deploy Container') {
            steps {
                bat '''
                docker stop %CONTAINER_NAME% 2>NUL
                if %ERRORLEVEL% EQU 0 docker rm %CONTAINER_NAME%
                docker run -d --name %CONTAINER_NAME% -p 4173:4173 -p 5001:5001 %IMAGE_NAME%:latest
                '''
            }
        }

    }

    post {
        success {
            echo 'ISATS Docker pipeline completed successfully!'
        }

        failure {
            echo 'ISATS pipeline failed. Check the Jenkins console output.'
        }
    }
}
