
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        IMAGE_NAME = 'isats-app'
        CONTAINER_NAME = 'isats-container'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out ISATS source code...'
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
                echo 'Installing project dependencies...'
                bat 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running ISATS tests...'
                bat 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building ISATS Docker image...'
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

                    echo Removing previous container...
                    docker rm -f %CONTAINER_NAME% >NUL 2>&1

                    echo Starting new ISATS container...

                    docker run -d ^
                      --name %CONTAINER_NAME% ^
                      --env-file "%ENV_FILE%" ^
                      --mount "type=bind,source=%FIREBASE_FILE%,target=/app/server/secrets/firebase-service-account.json,readonly" ^
                      -p 4173:4173 ^
                      -p 5001:5001 ^
                      %IMAGE_NAME%:latest

                    if errorlevel 1 exit /b 1

                    echo Container deployment command completed.
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Checking backend health...'

                bat '''
                powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $ok=$false; for($i=0;$i -lt 20;$i++){ try { $r=Invoke-RestMethod 'http://localhost:5001/api/health' -TimeoutSec 5; if($r.ok -eq $true){$ok=$true; Write-Host 'Backend health check passed'; break} } catch { Write-Host 'Waiting for backend...'; }; Start-Sleep -Seconds 3 }; if(-not $ok){ docker logs isats-container; throw 'Backend health check failed' }"

                if errorlevel 1 exit /b 1

                powershell -NoProfile -Command "try { $r=Invoke-WebRequest 'http://localhost:4173/' -UseBasicParsing -TimeoutSec 10; if($r.StatusCode -ne 200){exit 1}; Write-Host 'Frontend health check passed' } catch { Write-Host $_; exit 1 }"
                '''
            }
        }
    }

    post {
        success {
            echo 'ISATS CI/CD pipeline completed successfully!'
            echo 'Frontend: http://localhost:4173'
            echo 'Backend: http://localhost:5001/api/health'
        }

        failure {
            echo 'ISATS deployment failed. Checking container logs...'
            bat 'docker logs isats-container 2>NUL || exit /b 0'
        }
    }
}
