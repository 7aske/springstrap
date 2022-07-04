import JavaClass from "./def/JavaClass";
import { uncapitalize } from "./utils";

export default class Config extends JavaClass {
	private readonly _className: string;

	constructor(domain: string, options?: SpringStrapOptions) {
		super(domain, "config");
		super.imports = [
			"org.springframework.context.annotation.Configuration",
		];
		super.annotations = [
			"Configuration",
		];
		this.lombok = false;
		if (options && options.auditable) {
			super.imports.push("org.springframework.data.jpa.repository.config.EnableJpaAuditing");
			super.annotations.push("EnableJpaAuditing");
		}

		if (options && options.base) {
			super.imports.push(`${options.domain ? options.domain + "." : ""}generic.Exclude`);
			super.imports.push("org.springframework.context.annotation.*");
			super.imports.push("org.springframework.data.jpa.repository.config.EnableJpaRepositories");
			super.annotations.push(`EnableJpaRepositories(value = "${options.domain ? options.domain + "." : ""}repository",
				excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, value = Exclude.class))`)
		}
		this.auditable = false;
		this._className = "Config";
	}

	public get className(): string {
		return this._className;
	}

	public get varName(): string {
		return uncapitalize(this._className);
	}

	public get code(): string {
		return this.wrap();
	}
}
