import JavaClass from "../def/JavaClass";
import { uncapitalize } from "../utils";

export default class GenericSpecificationConverter extends JavaClass {
	constructor(domain: string, options: SpringStrapOptions) {
		super(domain, "specification", options);
	}

	get className(): string {
		return "GenericSpecificationConverter";
	}

	get code(): string {
		return `package ${this.package};

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Deque;

@Component
public class GenericSpecificationConverter implements Converter<String, Specification<?>> {

	@Override
	public Specification<?> convert(String str) {
		if (str.isEmpty())
			return null;

		try {
			Deque<?> deque = new CriteriaParser().parse(str);
			GenericSpecificationBuilder<? extends Serializable> specificationBuilder = new GenericSpecificationBuilder<>();
			return specificationBuilder.build(deque, GenericSpecification::new);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

}`;
	}

	get varName(): string {
		return uncapitalize(this.className);
	}
}
