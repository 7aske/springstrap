import JavaClass from "../def/JavaClass";
import { uncapitalize } from "../utils";

export default class JwtAuthorizationFilter extends JavaClass {
	constructor(domain: string, options: SpringStrapOptions) {
		super(domain, "security", options);
		super.superClasses = [
			"BasicAuthenticationFilter",
		];
		super.imports = [
			"org.springframework.security.authentication.AuthenticationManager",
			"org.springframework.security.core.Authentication",
			"org.springframework.security.core.context.SecurityContextHolder",
			"org.springframework.security.core.AuthenticationException",
			"org.springframework.security.web.authentication.www.BasicAuthenticationFilter",
			"javax.servlet.FilterChain",
			"javax.servlet.ServletException",
			"javax.servlet.http.HttpServletRequest",
			"javax.servlet.http.HttpServletResponse",
			"java.io.IOException",
		];
	}

	get className(): string {
		return "JwtAuthorizationFilter";
	}

	get code(): string {
		return this.wrap(`private final JwtProvider jwtProvider;

    public JwtAuthorizationFilter(AuthenticationManager authenticationManager, JwtProvider jwtProvider) {
        super(authenticationManager);
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain filterChain) throws IOException, ServletException {
        try {
			Authentication auth = getAuthenticationManager().authenticate(jwtProvider.getAuthentication(req));
			SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (AuthenticationException ignored) {}
        filterChain.doFilter(req, res);
    }`);
	}

	get varName(): string {
		return uncapitalize(this.className);
	}

}
