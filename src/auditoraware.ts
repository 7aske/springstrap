import JavaClass from "./def/JavaClass";
import { uncapitalize } from "./utils";

export default class AuditorAware extends JavaClass {
	private readonly _className: string;
	constructor(domain: string) {
		super(domain, "config");
		this.lombok = false;
		this.auditable = false;
		this._className = "CustomAuditorAware";
	}

	public get className(): string {
		return this._className;
	}

	public get varName(): string {
		return uncapitalize(this._className);
	}

	public get code() {
		return `package ${this.package};

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CustomAuditorAware implements AuditorAware<String> {
	@Override
	public Optional<String> getCurrentAuditor() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null) {
			return Optional.of("system");
		}

		return Optional.of(authentication.getName());
	}
}`;
	}
}
