import JavaClass from "../def/JavaClass";
import { uncapitalize } from "../utils";

export default class ServletInitializer extends JavaClass {
	private readonly _sourceClassName: string;

	constructor(domain: string, options: SpringStrapOptions, sourceClassName: string) {
		super(domain, "", options);
		this._sourceClassName = sourceClassName;
	}

	get className(): string {
		return "ServletInitializer";
	}

	get code(): string {
		return `package ${this.package};

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

public class ServletInitializer extends SpringBootServletInitializer {

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(${this._sourceClassName}.class);
	}
}`;
	}

	get varName(): string {
		return uncapitalize(this.className);
	}

}
