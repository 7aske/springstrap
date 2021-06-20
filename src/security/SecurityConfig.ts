import JavaClass from "../def/JavaClass";
import { uncapitalize } from "../utils";

export default class SecurityConfig extends JavaClass {
	constructor(domain: string, options: SpringStrapOptions) {
		super(domain, "security", options);
		super.annotations = [
			"Configuration",
			"EnableWebSecurity",
		];
		super.superClasses = [
			"WebSecurityConfigurerAdapter",
		];
		super.imports = [
			"org.springframework.beans.factory.annotation.Qualifier",
			"org.springframework.context.annotation.Bean",
			"org.springframework.context.annotation.Configuration",
			"org.springframework.security.authentication.AuthenticationManager",
			"org.springframework.security.authentication.BadCredentialsException",
			"org.springframework.security.authentication.UsernamePasswordAuthenticationToken",
			"org.springframework.security.config.annotation.web.builders.HttpSecurity",
			"org.springframework.security.config.annotation.web.configuration.EnableWebSecurity",
			"org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter",
			"org.springframework.security.config.http.SessionCreationPolicy",
			"org.springframework.security.core.userdetails.UserDetails",
			"org.springframework.security.core.userdetails.UserDetailsService",
			"org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder",
			"org.springframework.security.crypto.password.PasswordEncoder",
			"org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter",
			"java.util.Collections",
			"java.util.Locale",
		];
	}

	get className(): string {
		return "SecurityConfig";
	}

	get code(): string {
		return this.wrap(`private final JwtProvider jwtProvider;
	private final UserDetailsService userDetailsService;
	
	public SecurityConfig(JwtProvider jwtProvider, UserDetailsService userDetailsService) {
		this.jwtProvider = jwtProvider;
		this.userDetailsService = userDetailsService;
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.httpBasic().disable()
				.csrf().disable()
				.cors().and()
				.authorizeRequests().anyRequest().authenticated().and()
				.addFilter(new JwtAuthenticationFilter(authenticationManager(), jwtProvider))
				.addFilterBefore(new JwtAuthorizationFilter(authorizationManager(), jwtProvider), UsernamePasswordAuthenticationFilter.class)
				.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and();
	}

	@Bean
	@Qualifier("authenticationManager")
	@Override
	public AuthenticationManager authenticationManager() {
		return authentication -> {
			String username = authentication.getName().toLowerCase(Locale.ROOT).trim();
			String password = authentication.getCredentials().toString();
			UserDetails user = userDetailsService.loadUserByUsername(username);

			if (!passwordEncoder().matches(password, user.getPassword()))
				throw new BadCredentialsException("auth.invalidCredentials");

			if (!user.isCredentialsNonExpired())
				return new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());

			return new UsernamePasswordAuthenticationToken(username, null, user.getAuthorities());
		};
	}

	@Bean
	@Qualifier("authorizationManager")
	public AuthenticationManager authorizationManager() {
		return authentication -> {
			if (authentication == null)
				return null;

			String username = authentication.getName().toLowerCase(Locale.ROOT).trim();
			UserDetails user = userDetailsService.loadUserByUsername(username);

			if (!user.isCredentialsNonExpired())
				return new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());

			return new UsernamePasswordAuthenticationToken(username, null, user.getAuthorities());
		};
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}`);
	}

	get varName(): string {
		return uncapitalize(this.className);
	}

}
