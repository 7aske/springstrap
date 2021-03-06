import { uncapitalize, formatImports, formatAnnotations, plural, list } from "./utils";
import Service from "./service";
import JavaClass from "./def/JavaClass";
import { ControllerMethodBuilder } from "./methodBuilder";

export default class Controller extends JavaClass {
	private readonly _service: Service;
	private readonly _endpoint: string;
	private readonly _className: string;

	constructor(service: Service, domain: string, options?: SpringStrapOptions) {
		super(domain, "controller", options);
		this._service = service;
		this._className = service.entity.className + "Controller";
		this._endpoint = plural(this._service.entity.tableName.replace("_", "-"));
	}

	public get className(): string {
		return this._className;
	}

	public get varName(): string {
		return uncapitalize(this._className);
	}

	public get code(): string {
		const domain = this.domain;
		const ent = this._service.entity;
		const serviceName = this._service.className;
		const serviceVarName = this._service.varName;
		const endpoint = this.endpoint;

		const imports = [
			`${domain ? domain + "." : ""}entity.*`,
			`${domain ? domain + "." : ""}service.*`,
			"org.springframework.web.bind.annotation.*",
			"org.springframework.http.ResponseEntity",
			"org.springframework.http.HttpStatus",
			"java.util.List",
		];
		const lombokImports = [
			`lombok.*`,
		];
		const noLombokImports = [
			`org.springframework.web.bind.annotation.Autowired`,
		];
		const annotations = [
			`RestController`,
			`RequestMapping("/${endpoint}")`,
		];
		const lombokAnnotations = [
			"RequiredArgsConstructor",
		];

		const swaggerAnnotations = [
			"io.swagger.annotations.ApiOperation",
		];

		const services = [
			`${serviceName} ${serviceVarName}`,
		];

		if (this.options.lombok) imports.push(...lombokImports);
		if (!this.options.lombok) imports.push(...noLombokImports);
		if (this.options.lombok) annotations.push(...lombokAnnotations);
		if (this.options.swagger) imports.push(...swaggerAnnotations);
		if (this.options.specification) imports.push("org.springframework.data.jpa.domain.Specification");
		if (this._service.entity.enums.length > 0) imports.push(`${domain ? domain + "." : ""}entity.domain.*`);

		let out = `package ${this.package};\n\n`;
		out += formatImports(imports);
		out += formatAnnotations(annotations);
		out += `public class ${this.className} {\n`;

		services.forEach(service => {
			this.options.lombok ?
				out += `\tprivate final ${service};\n\n`
				:
				out += `\t@Autowired\n\tprivate ${service};\n\n`;
		});

		const getAll = this.getMethodBuilder(`getAll${plural(ent.className)}`)
			.getMapping();
		if (this.options.specification) {
			getAll
				.requestParam([[`@RequestParam(name = "q", required = false)`, `Specification<${ent.className}>`, "specification"]])
				.implementation(`\treturn ResponseEntity.ok(${serviceVarName}.findAll(specification));\n`);
		} else {
			getAll
				.implementation(`\treturn ResponseEntity.ok(${serviceVarName}.findAll());\n`);
		}

		out += getAll.return(list(ent.className))
			.build()
			.generate();

		out += this.getMethodBuilder(`get${ent.className}ById`)
			.getMapping(ent.idPathVars)
			.pathVariables(ent.idArgs)
			.implementation(`\treturn ResponseEntity.ok(${serviceVarName}.findById(${ent.idVars}));\n`)
			.return(ent.className)
			.build()
			.generate();

		out += this.getMethodBuilder(`save${ent.className}`)
			.postMapping()
			.requestBody([[ent.className, ent.varName]])
			.implementation(`\treturn ResponseEntity.status(HttpStatus.CREATED).body(${serviceVarName}.save(${ent.varName}));\n`)
			.return(ent.className)
			.build()
			.generate();

		out += this.getMethodBuilder(`update${ent.className}`)
			.putMapping()
			.requestBody([[ent.className, ent.varName]])
			.implementation(`\treturn ResponseEntity.ok(${serviceVarName}.update(${ent.varName}));\n`)
			.return(ent.className)
			.build()
			.generate();

		out += this.getMethodBuilder(`delete${ent.className}ById`)
			.deleteMapping(ent.idPathVars)
			.pathVariables(ent.idArgs)
			.implementation(`\t${serviceVarName}.deleteById(${ent.idVars});\n`)
			.build()
			.generate();

		ent.mtmColumns.forEach(col => {
			const listName = plural(col.target.replace(/_/g, "-"));

			out += this.getMethodBuilder(`get${ent.className}${plural(col.targetClassName)}`)
				.getMapping(`${ent.idPathVars}/${listName}`)
				.pathVariables(ent.idArgs)
				.implementation(`\treturn ResponseEntity.ok(${serviceVarName}.findAll${plural(col.targetClassName)}ById(${ent.idVars}));\n`)
				.return(list(col.targetClassName))
				.build()
				.generate();

			out += this.getMethodBuilder(`set${ent.className}${plural(col.targetClassName)}`)
				.postMapping(`${ent.idPathVars}/${listName}`)
				.pathVariables(ent.idArgs)
				.requestBody([[list(col.targetClassName), col.targetVarName]])
				.implementation(`\treturn ResponseEntity.ok(${serviceVarName}.set${plural(col.targetClassName)}ById(${ent.idVars}, ${col.targetVarName}));\n`)
				.return(list(col.targetClassName))
				.build()
				.generate();

			out += this.getMethodBuilder(`add${ent.className}${plural(col.targetClassName)}`)
				.putMapping(`${ent.idPathVars}/${listName}`)
				.pathVariables(ent.idArgs)
				.requestBody([[list(col.targetClassName), col.targetVarName]])
				.implementation(`\treturn ResponseEntity.ok(${serviceVarName}.add${plural(col.targetClassName)}ById(${ent.idVars}, ${col.targetVarName}));\n`)
				.return(list(col.targetClassName))
				.build()
				.generate();

			out += this.getMethodBuilder(`delete${ent.className}${plural(col.targetClassName)}`)
				.deleteMapping(`${ent.idPathVars}/${listName}`)
				.pathVariables(ent.idArgs)
				.requestBody([[list(col.targetClassName), col.targetVarName]])
				.implementation(`\treturn ResponseEntity.ok(${serviceVarName}.delete${plural(col.targetClassName)}ById(${ent.idVars}, ${col.targetVarName}));\n`)
				.return(list(col.targetClassName))
				.build()
				.generate();
		});

		this._service.entity.enums.forEach(e => {
			out += this.getMethodBuilder(`get${ent.className}${e.className}`)
				.getMapping(plural(uncapitalize(e.className)))
				.implementation(`\treturn ResponseEntity.ok(${e.className}.values());\n`)
				.return("Object[]")
				.build()
				.generate();
		});

		out += "}\n\n";

		return out;
	}

	private getMethodBuilder(name: string) {
		const retval = new ControllerMethodBuilder()
			.name(name);
		if (this.options.swagger)
			return retval.defaultNickname();
		return retval;
	}

	public get endpoint(): string {
		return this._endpoint;
	}
}
