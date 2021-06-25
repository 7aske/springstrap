import dependencyRegistrar from "./DependencyRegistrar";

const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>`;
const rootAttributes = `xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd"`;

const defaultOptions: PomXmlOptions = {
	modelVersion: "4.0.0",
	groupId: "com.example",
	artifactId: "demo",
	name: "demo",
	description: "Springstrap project",
	packaging: "war",
	parent: dependencyRegistrar["spring-starter-parent"][0],
	dependencies: [],
	plugins: [{
		groupId: "org.springframework.boot",
		artifactId: "spring-boot-maven-plugin"
	}],
	properties: undefined,
	version: "1.0",
	javaVersion: "11",

};

const renderProperties = (props: Record<string, string>): string => {
	return `<properties>
${Object.keys(props).map(key => `\t\t<${key}>${props[key]}</${key}>`).join("\n")}
	</properties>`
}

const renderDependencies = (dependencies?: PomXmlDependency[]): string => {
	if (!dependencies)
		return `<dependencies>\n</dependencies>`
	return `<dependencies>
${dependencies.sort(a => a.scope === "test" ? 1 : 0).map(dep => renderDependency(dep)).join("\n")}
	</dependencies>`
}

const renderDependency = (dep: PomXmlDependency, root: string = "dependency"): string => {
	return `		<${root}>
			<groupId>${dep.groupId}</groupId>
			<artifactId>${dep.artifactId}</artifactId>
${dep.optional ? "\t\t\t<optional>true</optional>\n": ""}\
${dep.scope ? `\t\t\t<scope>${dep.scope}</scope>\n`: ""}\
${dep.version ? `\t\t\t<version>${dep.version}</version>\n`: ""}\
${dep.relativePath ? `\t\t\t<relativePath/>\n`: ""}\
		</${root}>`;
}

const renderPlugin = (plug: PomXmlPlugin): string => {
	return `\t\t\t<plugin>
	\t\t\t<groupId>${plug.groupId}</groupId>
	\t\t\t<artifactId>${plug.artifactId}</artifactId>
\t\t\t</plugin>`;
}

const renderPlugins = (plugins?: PomXmlPlugin[]): string => {
	if (!plugins)
		return `\t\t<plugins>\n</plugins>`
	return `\t\t<plugins>
${plugins.map(plug => renderPlugin(plug)).join("\n")}
\t\t</plugins>`
}

export const generatePomXml = (opt: PomXmlOptions = defaultOptions): string => {
	opt = {...defaultOptions, ...opt};
	return `${xmlHeader}
<project ${rootAttributes}>
	<modelVersion>${opt.modelVersion}</modelVersion>
${renderDependency(opt.parent!, "parent")}
	<groupId>${opt.groupId}</groupId>
	<artifactId>${opt.artifactId}</artifactId>
	<version>${opt.version}</version>
	<packaging>${opt.packaging}</packaging>
	<name>${opt.name}</name>
	<description>${opt.description}</description>
	${renderProperties({...opt.properties, "java.version": opt.javaVersion})}
	${renderDependencies(opt.dependencies)}
	<build>
${renderPlugins(opt.plugins)}
	</build>

</project>`;
};
