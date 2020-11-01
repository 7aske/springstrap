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
