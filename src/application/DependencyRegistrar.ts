const dependencyRegistrar: Record<string, PomXmlDependency[]> = {
	"spring-starter-parent": [
		{
			artifactId: "spring-boot-starter-parent",
			groupId: "org.springframework.boot",
			version: "2.5.1",
			relativePath: true,
		}
	],
	"spring-boot": [
		{
			groupId: "org.springframework.boot",
			artifactId: "spring-boot-starter-web",
		},
		{
			groupId: "org.springframework.boot",
			artifactId: "spring-boot-starter-tomcat",
			scope: "provided",
		},
		{
			groupId: "org.springframework.boot",
			artifactId: "spring-boot-starter-test",
			scope: "test",
		},
	],
	"spring-security": [
		{
			groupId: "org.springframework.boot",
			artifactId: "spring-boot-starter-security",
		},
		{
			groupId: "org.springframework.security",
			artifactId: "spring-security-test",
			scope: "test",
		},
	],
	"java-jwt": [
		{
			groupId: "com.auth0",
			artifactId: "java-jwt",
			version: "3.10.3"
		}
	],
	"swagger": [
		{
			groupId: "io.springfox",
			artifactId: "springfox-swagger2",
			version: "2.9.2"
		},
		{
			groupId: "io.springfox",
			artifactId: "springfox-swagger-ui",
			version: "2.9.2"
		}
	],
	"spring-data-jpa": [
		{
			groupId: "org.springframework.boot",
			artifactId: "spring-boot-starter-data-jpa",
		},
	],
	"spring-devtools": [
		{
			groupId: "org.springframework.boot",
			artifactId: "spring-boot-devtools",
			scope: "runtime",
			optional: true,
		},
	],
	"spring-configuration-processor": [
		{
			groupId: "org.springframework.boot",
			artifactId: "spring-boot-configuration-processor",
			optional: true,
		},
	],
	"mariadb": [
		{
			groupId: "org.mariadb.jdbc",
			artifactId: "mariadb-java-client",
			scope: "runtime",
		},
	],
	"mysql": [
		{
			groupId: "mysql",
			artifactId: "mysql-connector-java",
			scope: "runtime",
		},
	],
	"lombok": [
		{
			groupId: "org.projectlombok",
			artifactId: "lombok",
			optional: true,
		},
	],
};

export default dependencyRegistrar;
