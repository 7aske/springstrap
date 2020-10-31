export default class AuditorAware {
	domain: string;
	constructor(domain: string) {
		this.domain = domain;
	}

	public get code() {
		return `package ${this.domain}.config;

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
