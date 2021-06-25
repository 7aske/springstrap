import JavaClass from "../def/JavaClass";
import { uncapitalize } from "../utils";

export default class JwtAuthenticationFilter extends JavaClass {
	constructor(domain: string, options: SpringStrapOptions) {
		super(domain, "security", options);
		super.imports = [
			`${this.domain ? this.domain + "." : ""}entity.User`,
			"com.fasterxml.jackson.databind.ObjectMapper",
			"java.io.IOException",
			"java.nio.charset.StandardCharsets",
			"javax.servlet.FilterChain",
			"javax.servlet.http.HttpServletRequest",
			"javax.servlet.http.HttpServletResponse",
			"org.springframework.http.HttpStatus",
			"org.springframework.http.MediaType",
			"org.springframework.security.authentication.AuthenticationManager",
			"org.springframework.security.authentication.UsernamePasswordAuthenticationToken",
			"org.springframework.security.core.Authentication",
			"org.springframework.security.core.AuthenticationException",
			"org.springframework.security.core.userdetails.UsernameNotFoundException",
			"org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter",
			"static org.springframework.http.HttpHeaders.*",
			"static org.springframework.http.HttpStatus.NO_CONTENT",
		];
		super.superClasses = [
			"UsernamePasswordAuthenticationFilter"
		]
	}

	get className(): string {
		return "JwtAuthenticationFilter";
	}

	get code(): string {
		return this.wrap(`private final JwtProvider jwtProvider;

	public JwtAuthenticationFilter(AuthenticationManager authenticationManager, JwtProvider jwtProvider) {
		super(authenticationManager);
		this.jwtProvider = jwtProvider;
	}

	@Override
	public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
		ObjectMapper mapper = new ObjectMapper();
		try {
			User user = mapper.readValue(request.getInputStream(), User.class);
			return getAuthenticationManager().authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword(), null));
		} catch (IOException e) {
			throw new UsernameNotFoundException("User not found");
		}
	}

	@Override
	protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException {
		String token = jwtProvider.createToken(authResult.getName(), authResult.getAuthorities());
		response.setHeader(AUTHORIZATION, "Bearer " + token);
		response.setStatus(NO_CONTENT.value());
	}

	@Override
	protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException {
		response.setStatus(HttpStatus.UNAUTHORIZED.value());
		response.setContentType(MediaType.TEXT_PLAIN.toString());
		response.setCharacterEncoding(StandardCharsets.UTF_8.toString());
		response.getWriter().write(failed.getMessage());
	}`);
	}

	get varName(): string {
		return uncapitalize(this.className);
	}

}
