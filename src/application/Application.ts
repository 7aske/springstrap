import JavaClass from "../def/JavaClass";
import { uncapitalize, capitalize } from "../utils";

export default class Application extends JavaClass {
	constructor(domain: string, options: SpringStrapOptions) {
		super(domain, "", options);
	}

	get className(): string {
		if (this.domain) {
			const last = this.domain.split(".").splice(-1, 1)[0];
			if (!last) return "Application";
			return `${capitalize(last)}Application`
		}
		return "Application";
	}

	get code(): string {
		return `package ${this.package};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${this.className} {

	public static void main(String[] args) {
		SpringApplication.run(${this.className}.class, args);
	}

}`;
	}

	get varName(): string {
		return uncapitalize(this.className)
	}

}
