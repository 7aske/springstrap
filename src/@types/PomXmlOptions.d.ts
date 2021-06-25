type PomXmlPackaging = "war" | "jar";
declare interface PomXmlDependency {
	groupId: string;
	artifactId: string;
	version?: string;
	optional?: boolean;
	relativePath?: boolean;
	scope?: "runtime" | "test" | "provided";
}
declare interface PomXmlPlugin {
	groupId: string;
	artifactId: string;
	configuration?: {excludes: string[]}
}
declare interface PomXmlOptions {
	modelVersion?: string;
	parent?: PomXmlDependency;
	groupId: string;
	artifactId: string;
	version?: string;
	packaging: PomXmlPackaging;
	name: string;
	description?: string;
	javaVersion: string;
	properties?: Record<string, string>
	deps?: string[];
	dependencies?: PomXmlDependency[];
	plugins?: PomXmlPlugin[];
}
