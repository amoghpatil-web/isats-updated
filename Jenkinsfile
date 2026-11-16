
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        disableDefaultCheckout()
    }

    environment {
        IMAGE_NAME = 'isats-app'
        CONTAINER_NAME = 'isats-container'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Node Version') {
            steps {
                bat 'node --version'
                bat 'npm --version'
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

        stage('Build Docker Image') {
            steps {
                bat 'docker build --pull -t %IMAGE_NAME%:latest .'
            }
        }

        stage('Deploy Container') {
            steps {
                withCredentials([
                    file(credentialsId: 'isats-env', variable: 'ENV_FILE'),
                    file(credentialsId: 'isats-firebase', variable: 'FIREBASE_FILE')
                ]) {
                    bat '''
                    @echo off

                    echo Removing old container...
                    docker rm -f %CONTAINER_NAME% >NUL 2>&1

                    echo Deploying new container...

                    docker run -d ^
                      --name %CONTAINER_NAME% ^
                      --env-file "%ENV_FILE%" ^
                      --mount "type=bind,source=%FIREBASE_FILE%,target=/app/server/secrets/firebase-service-account.json,readonly" ^
                      -p 4173:4173 ^
                      -p 5001:5001 ^
                      %IMAGE_NAME%:latest

                    if errorlevel 1 exit /b 1
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                bat '''
                powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $ok=$false; for($i=0;$i -lt 20;$i++){ try { $r=Invoke-RestMethod 'http://localhost:5001/api/health' -TimeoutSec 5; if($r.ok -eq $true){$ok=$true; Write-Host 'Backend health check passed'; break} } catch { Write-Host 'Waiting for backend...'; }; Start-Sleep -Seconds 3 }; if(-not $ok){ docker logs isats-container; throw 'Backend health check failed' }"
                '''
            }
        }
    }

    post {
        success {
            echo 'ISATS deployment successful!'
        }

        failure {
            echo 'ISATS deployment failed!'
            bat 'docker logs isats-container'
        }
    }
}
