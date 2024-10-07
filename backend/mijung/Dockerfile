# springboot image
FROM openjdk:17-oracle
EXPOSE 8080
ARG PROFILE
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar
ENV TZ=Asia/Seoul
ENV SPRING_PROFILES_ACTIVE=${PROFILE}
<<<<<<< HEAD
ENTRYPOINT ["java","--add-exports", "java.base/sun.nio.ch=ALL-UNNAMED", "-jar","/app.jar"]
=======
ENTRYPOINT ["java", "--add-exports", "java.base/sun.nio.ch=ALL-UNNAMED", "-jar","/app.jar"]
>>>>>>> acbe25aea03ea2e0b6aedcbdf713cd8b6913dbc2
