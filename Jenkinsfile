pipeline {
    agent any
    tools {
      maven 'Maven'
      'org.jenkinsci.plugins.docker.commons.tools.DockerTool' 'docker'
    }   
    
    
    stages {
        /*
        stage('SonarQube') {
            steps {
                // Sonarqube
                sh "mvn sonar:sonar -X  -Dsonar.projectKey=consultaCEP -Dsonar.host.url=http://localhost:9000 -Dsonar.login=b2209b7fa758d4269f3f1ea8d0c80eb059120828"
            }
        } */
        stage('Sonarqube') {
            environment {
                scannerHome = tool 'SonarQubeScanner'
            }
            steps {
                withSonarQubeEnv('SonarQubeScanner') {
                    waitForQualityGate webhookSecretId: 'b2209b7fa758d4269f3f1ea8d0c80eb059120828'
                    sh "${scannerHome}/bin/sonar-scanner"
                }
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        /*
        stage('Build') { 
            steps {
                sh "mvn -f pom.xml package" 
            }
        }
        */
        stage('Create docker image') { 
            steps {
                script {
                    def scmVars = checkout([
                        $class: 'GitSCM',
                        doGenerateSubmoduleConfigurations: false,
                        userRemoteConfigs: [[
                            url: 'https://github.com/hoshikawa2/consultaCEP.git'
                          ]],
                        branches: [ [name: '*/main'] ]
                      ])
                    /* app = docker.build(registry + "/runhtml:latest") */
                    sh 'docker build -t iad.ocir.io/' + params.DOCKER_REPO + '/runhtml:latest .'
                }
            }
        }
        stage('Push image to OCIR') { 
            steps {
                script {
                    def scmVars = checkout([
                        $class: 'GitSCM',
                        doGenerateSubmoduleConfigurations: false,
                        userRemoteConfigs: [[
                            url: 'https://github.com/hoshikawa2/consultaCEP.git'
                          ]],
                        branches: [ [name: '*/main'] ]
                      ])
    /*
                            docker.withRegistry('https://iad.ocir.io', 'docker-credential') {
                            app.push(registry + "/runhtml")
                        }               
    */
                    sh 'docker login https://iad.ocir.io -u ' + params.REGISTRY_USERNAME + ' -p "' + params.REGISTRY_TOKEN + '"'
                    sh 'docker push iad.ocir.io/' + params.DOCKER_REPO + '/runhtml:latest'
                }                       
            }
        }
        
        stage('Remove Unused docker image') {
          steps{
            sh "docker rmi iad.ocir.io/" + params.DOCKER_REPO + "/runhtml:latest"
          }
        } 
    }
}
