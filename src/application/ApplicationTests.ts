import JavaClass from "../def/JavaClass";
import { capitalize, uncapitalize } from "../utils";

export default class ApplicationTests extends JavaClass {
	constructor(domain: string, options: SpringStrapOptions) {
		super(domain, "", options);
	}

	get className(): string {
		if (this.domain) {
			const last = this.domain.split(".").splice(-1, 1)[0];
			if (!last) return "ApplicationTests";
			return `${capitalize(last)}ApplicationTests`
		}
		return "ApplicationTests";
	}

	get code(): string {
		return `package ${this.package};

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ${this.className} {

	@Test
	void contextLoads() {
	}

}`;
	}

	get varName(): string {
		return uncapitalize(this.className);
	}

}
