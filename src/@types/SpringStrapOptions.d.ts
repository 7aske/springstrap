declare interface SpringStrapOptions {
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
	ignore?: string;
	tables?: string;
	swagger?: boolean;
	enums?: string;
}
