pipeline {
    agent any
    tools {
      maven 'Maven'
      'org.jenkinsci.plugins.docker.commons.tools.DockerTool' 'docker'
    }   
    
    
    stages {
        /* */
        stage('SonarQube') {
            steps {
                // Sonarqube
                sh "mvn sonar:sonar  -Dsonar.projectKey=consultaCEP:main -Dsonar.host.url=http://129.159.69.133:9000 -Dsonar.login=b2209b7fa758d4269f3f1ea8d0c80eb059120828"
            }
        }/* */
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
