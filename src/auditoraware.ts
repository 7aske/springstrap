export default class AuditorAware {
	private readonly _domain: string;
	constructor(domain: string) {
		this._domain = domain;
	}

	public get code() {
		return `${this.packageName}

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

	public get domain(){
		return this._domain;
	}

	public get packageName(): string {
		if (!this._domain) return "package config;";
		return `package ${this._domain}.config;`;
	}
}
