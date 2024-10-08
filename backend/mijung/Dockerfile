# springboot image
FROM openjdk:17-oracle
EXPOSE 8080
ARG PROFILE
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar
ENV TZ=Asia/Seoul
ENV SPRING_PROFILES_ACTIVE=${PROFILE}
ENTRYPOINT ["java", "--add-exports", "java.base/sun.nio.ch=ALL-UNNAMED", "-jar","/app.jar"]
