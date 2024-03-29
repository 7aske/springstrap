declare interface SpringStrapOptions {
	filename: string;
	lombok?: boolean;
	auditable?: boolean;
	type?: "mariadb" | "mysql";
	output?: string;
	domain: string;
	overwrite?: boolean;
	entity?: boolean;
	service?: boolean;
	serviceimpl?: boolean;
	controller?: boolean;
	repository?: boolean;
	ignore?: string[];
	tables?: string[];
	swagger?: boolean;
	security?: boolean;
	enums?: EnumType[];
	specification?: boolean;
	sort?: boolean;
	pageable?: boolean;
	base?: boolean;
	pom?: boolean;
	pomOptions?: PomXmlOptions
	noBoilerplate?: boolean
}
