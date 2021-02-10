pipeline {
    agent any
    tools {
      'org.jenkinsci.plugins.docker.commons.tools.DockerTool' 'docker'
    }   
    /*
    environment {
        registry = "iad.ocir.io/idavixsf5sbx/cristianohoshikawa"
        registryCredential = 'docker-credential'
        app = ''
    }
    */
    stages {
        /*
        stage('SonarQube') {
            steps {
                // Sonarqube
                sh "mvn sonar:sonar  -Dsonar.projectKey=runHTML -Dsonar.host.url=http://sonarqube:9000 -Dsonar.login=8e17c50243b436dbf0ecea60d8e54412d1c7d793"
            }
        }*/
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
