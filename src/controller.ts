import { DEFAULT_SSOPT, uncapitalize, formatImports, formatAnnotations, plural, capitalize } from "./utils";
import Service from "./service";
import JavaClass from "./def/JavaClass";
import entity from "./entity";

export default class Controller extends JavaClass {
	private readonly _service: Service;
	private readonly _endpoint: string;
	private readonly _className: string;

	constructor(service: Service, domain: string, options?: SpringStrapOptions) {
		super(domain, "controller", options);
		this._service = service;
		this._className = service.entity.className + "Controller"
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
		const entity = this._service.entity;
		const serviceName = this._service.className;
		const serviceVarName = this._service.varName;
		const endpoint = this.endpoint;

		const imports = [
			`${domain ? domain + "." : ""}entity.*`,
			`${domain ? domain + "." : ""}service.*`,
			"org.springframework.web.bind.annotation.*",
			`org.springframework.http.ResponseEntity`,
			`java.util.List`,
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

		const services = [
			`${serviceName} ${serviceVarName}`
		];

		if (this.options.lombok) imports.push(...lombokImports);
		if (!this.options.lombok) imports.push(...noLombokImports);
		if (this.options.lombok) annotations.push(...lombokAnnotations);
		if (this._service.entity.enums.length > 0) imports.push(`${domain ? domain + "." : ""}entity.domain.*`)

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

		out += `\t@GetMapping\n`;
		out += `\tpublic ResponseEntity<List<${entity.className}>> getAll() {\n`;
		out += `\t\treturn ResponseEntity.ok(${serviceVarName}.findAll());\n`;
		out += `\t}\n\n`;

		out += `\t@GetMapping("/{${entity.id.varName}}")\n`;
		out += `\tpublic ResponseEntity<${entity.className}> getById(@PathVariable ${entity.id.javaType} ${entity.id.varName}) {\n`;
		out += `\t\treturn ResponseEntity.ok(${serviceVarName}.findById(${entity.id.varName}));\n`;
		out += `\t}\n\n`;

		out += `\t@PostMapping\n`;
		out += `\tpublic ResponseEntity<${entity.className}> save(@RequestBody ${entity.className} ${entity.varName}) {\n`;
		out += `\t\treturn ResponseEntity.ok(${serviceVarName}.save(${entity.varName}));\n`;
		out += `\t}\n\n`;

		out += `\t@PutMapping\n`;
		out += `\tpublic ResponseEntity<${entity.className}> update(@RequestBody ${entity.className} ${entity.varName}) {\n`;
		out += `\t\treturn ResponseEntity.ok(${serviceVarName}.update(${entity.varName}));\n`;
		out += `\t}\n\n`;

		out += `\t@PutMapping("/{${entity.id.varName}}")\n`;
		out += `\tpublic ResponseEntity<${entity.className}> updateById(@PathVariable ${entity.id.javaType} ${entity.id.varName}, @RequestBody ${entity.className} ${entity.varName}) {\n`;
		out += `\t\t${entity.varName}.setId(${entity.id.varName});\n`;
		out += `\t\treturn ResponseEntity.ok(${serviceVarName}.update(${entity.varName}));\n`;
		out += `\t}\n\n`;

		out += `\t@DeleteMapping("/{${entity.id.varName}}")\n`;
		out += `\tpublic void deleteById(@PathVariable ${entity.id.javaType} ${entity.id.varName}) {\n`;
		out += `\t\t${serviceVarName}.deleteById(${entity.id.varName});\n`;
		out += `\t}\n\n`;

		this._service.entity.mtmColumns.forEach(col => {

			out += `\t@GetMapping("/{${entity.id.varName}}/${plural(col.target.replace("_", "-"))}")\n`;
			out += `\tpublic ResponseEntity<List<${col.targetClassName}>> getAll${plural(col.targetClassName)}(@PathVariable ${entity.id.javaType} ${entity.id.varName}) {\n`;
			out += `\t\treturn ResponseEntity.ok(${serviceVarName}.findAll${plural(col.targetClassName)}By${entity.id.className}(${entity.id.varName}));\n`;
			out += `\t}\n\n`;

		});

		this._service.entity.enums.forEach(e => {
			out += `\t@GetMapping("/${plural(uncapitalize(e.className))}")\n`;
			out += `\tpublic ResponseEntity<Object[]> get${e.className}() {\n`;
			out += `\t\treturn ResponseEntity.ok(${e.className}.values());\n`;
			out += `\t}\n\n`;
		})

		out += "}\n\n";

		return out;
	}

	public get endpoint(): string {
		return this._endpoint;
	}
}
