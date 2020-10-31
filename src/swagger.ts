export default class Swagger {
	private readonly _domain: string;

	constructor(domain: string) {
		this._domain = domain;
	}

	public get code() {
		return `${this.packageName}
		
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
@Profile("dev")
public class SwaggerConfig {
	@Bean
	public Docket api() {
		return new Docket(DocumentationType.SWAGGER_2)
				.select()
				.apis(RequestHandlerSelectors.any())
				.paths(PathSelectors.any())
				.build();
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
