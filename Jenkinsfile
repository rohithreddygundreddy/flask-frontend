@Library('devops') _

pipeline {
    agent any

    environment {
        GIT_CREDENTIALS_ID = 'ssh-key'
        FRONTEND_REPO_URL  = 'git@github.com:rohithreddygundreddy/flask-frontend.git'
    }

    stages {
        stage('Checkout Static Website') {
            steps {
                script {
                    repoCheckout(
                        repoUrl: FRONTEND_REPO_URL,
                        branch: 'main',
                        credentialsId: GIT_CREDENTIALS_ID,
                        dir: 'website'
                    )
                }
            }
        }

        stage('Verify Static Website Files') {
            steps {
                script {
                    frontendBuild(dir: 'website')
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Your HTML/CSS/JS project is valid!"
        }
        failure {
            echo "❌ Something is missing or incorrect. Check console output."
        }
    }
}



