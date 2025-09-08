pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        CYPRESS_CACHE_FOLDER = 'cypress_cache'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    // Install Node.js
                    sh '''
                        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
                        sudo apt-get install -y nodejs
                    '''
                    
                    // Verify installations
                    sh 'node --version'
                    sh 'npm --version'
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Client Dependencies') {
                    steps {
                        dir('client') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Server Dependencies') {
                    steps {
                        dir('server') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Seed Sample Data') {
            steps {
                dir('server') {
                    sh 'npm run seed:sample'
                }
            }
        }
        
        stage('Start Server') {
            steps {
                dir('server') {
                    sh 'npm start &'
                    sh 'sleep 10' // Wait for server to start
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        dir('client') {
                            sh 'npm run test:unit'
                        }
                        dir('server') {
                            sh 'npm run test:api'
                        }
                    }
                }
                stage('E2E Tests') {
                    steps {
                        dir('client') {
                            sh 'npm run test:e2e:ci'
                        }
                    }
                }
            }
        }
        
        stage('Generate Reports') {
            steps {
                dir('client') {
                    sh 'npm run merge:reports'
                    sh 'npm run generate:report'
                }
            }
        }
        
        stage('Archive Artifacts') {
            steps {
                // Archive test artifacts
                archiveArtifacts artifacts: 'client/cypress/videos/**/*', fingerprint: true
                archiveArtifacts artifacts: 'client/cypress/screenshots/**/*', fingerprint: true
                archiveArtifacts artifacts: 'client/cypress/reports/html/**/*', fingerprint: true
                archiveArtifacts artifacts: 'client/cypress/reports/merged-report.json', fingerprint: true
                
                // Archive JUnit reports for Jenkins trends
                publishTestResults testResultsPattern: 'client/cypress/reports/junit/*.xml'
            }
        }
        
        stage('Publish HTML Report') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'client/cypress/reports/html',
                    reportFiles: 'index.html',
                    reportName: 'Cypress Test Report'
                ])
            }
        }
    }
    
    post {
        always {
            // Clean up server process
            sh 'pkill -f "node.*index-real.js" || true'
            
            // Clean up workspace
            cleanWs()
        }
        
        success {
            script {
                // Send success notification to Slack
                def reportUrl = "${env.BUILD_URL}HTML_20Report/"
                def screenshotPath = "client/cypress/screenshots"
                
                // Find latest screenshot
                def screenshotFiles = sh(
                    script: "find ${screenshotPath} -name '*.png' -type f -exec ls -t {} + | head -1",
                    returnStdout: true
                ).trim()
                
                slackSend(
                    channel: '#testing',
                    color: 'good',
                    message: "✅ Test Suite Passed!\n📊 Report: ${reportUrl}\n🔗 Build: ${env.BUILD_URL}",
                    file: screenshotFiles ? screenshotFiles : null
                )
            }
        }
        
        failure {
            script {
                // Send failure notification to Slack
                def reportUrl = "${env.BUILD_URL}HTML_20Report/"
                def screenshotPath = "client/cypress/screenshots"
                
                // Find latest screenshot
                def screenshotFiles = sh(
                    script: "find ${screenshotPath} -name '*.png' -type f -exec ls -t {} + | head -1",
                    returnStdout: true
                ).trim()
                
                slackSend(
                    channel: '#testing',
                    color: 'danger',
                    message: "❌ Test Suite Failed!\n📊 Report: ${reportUrl}\n🔗 Build: ${env.BUILD_URL}",
                    file: screenshotFiles ? screenshotFiles : null
                )
            }
        }
    }
}
