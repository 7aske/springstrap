import JavaClass from "../def/JavaClass";
import { uncapitalize } from "../utils";

export default class JwtProvider extends JavaClass {
	constructor(domain: string, options: SpringStrapOptions) {
		super(domain, "security", options);
		super.imports = [
			"com.auth0.jwt.JWT",
			"com.auth0.jwt.algorithms.Algorithm",
			"com.auth0.jwt.exceptions.SignatureVerificationException",
			"com.auth0.jwt.exceptions.TokenExpiredException",
			"com.auth0.jwt.interfaces.DecodedJWT",
			"org.springframework.http.HttpHeaders",
			"org.springframework.security.authentication.BadCredentialsException",
			"org.springframework.security.authentication.CredentialsExpiredException",
			"org.springframework.security.authentication.UsernamePasswordAuthenticationToken",
			"org.springframework.security.core.Authentication",
			"org.springframework.security.core.GrantedAuthority",
			"org.springframework.security.core.authority.SimpleGrantedAuthority",
			"org.springframework.security.crypto.keygen.KeyGenerators",
			"org.springframework.stereotype.Component",
			"javax.servlet.http.HttpServletRequest",
			"java.util.Collection",
			"java.util.Date",
			"java.util.List",
			"java.util.stream.Collectors",
		];
		super.annotations = [
			"Component"
		]
	}

	get className(): string {
		return "JwtProvider";
	}

	get code(): string {
		return this.wrap(`private final byte[] SECRET = KeyGenerators.secureRandom(512).generateKey();
	private final Algorithm algorithm = Algorithm.HMAC512(SECRET);
	private final long VALIDITY = 7200000;

	public String createToken(String username, Collection<? extends GrantedAuthority> authorities) {
		Date now = new Date();
		Date validity = new Date(now.getTime() - VALIDITY);
		return JWT.create()
				.withSubject(username)
				.withArrayClaim("roles", authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()).toArray(new String[]{}))
				.withExpiresAt(validity)
				.sign(Algorithm.HMAC512(SECRET));
	}

	public DecodedJWT decode(String token) {
		if (token == null)
			throw new BadCredentialsException("No token provided");

		try {
			return JWT.require(algorithm)
					.build()
					.verify(token);
		} catch (TokenExpiredException ex) {
			throw new CredentialsExpiredException(ex.getMessage());
		} catch (SignatureVerificationException ex) {
			throw new BadCredentialsException(ex.getMessage());
		}
	}

	private List<GrantedAuthority> getAuthorities(DecodedJWT decoded) {
		List<String> roles = decoded.getClaim("roles").asList(String.class);
		return roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList());
	}

	private String getUsername(DecodedJWT decoded) {
		return decoded.getSubject();
	}

	public Authentication getAuthentication(String token) {
		DecodedJWT decoded = decode(token);
		if (token == null)
			return null;
		return new UsernamePasswordAuthenticationToken(getUsername(decoded), null, getAuthorities(decoded));
	}

	public Authentication getAuthentication(HttpServletRequest req) {
		return getAuthentication(resolveToken(req));
	}

	private String resolveToken(HttpServletRequest req) {
		String bearerToken = req.getHeader(HttpHeaders.AUTHORIZATION);

		if (bearerToken == null || !bearerToken.startsWith("Bearer "))
			return null;

		return bearerToken.substring("Bearer ".length());
	}`);
	}

	get varName(): string {
		return uncapitalize(this.className);
	}

}
