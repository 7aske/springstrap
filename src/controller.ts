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
		const ent = this._service.entity;
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
		out += `\tpublic ResponseEntity<List<${ent.className}>> getAll() {\n`;
		out += `\t\treturn ResponseEntity.ok(${serviceVarName}.findAll());\n`;
		out += `\t}\n\n`;

		out += `\t@GetMapping("/${ent.idPathVars}")\n`;
		out += `\tpublic ResponseEntity<${ent.className}> getById(${ent.idPathArgs}) {\n`;
		out += `\t\treturn ResponseEntity.ok(${serviceVarName}.findById(${ent.idVars}));\n`;
		out += `\t}\n\n`;

		out += `\t@PostMapping\n`;
		out += `\tpublic ResponseEntity<${ent.className}> save(@RequestBody ${ent.className} ${ent.varName}) {\n`;
		out += `\t\treturn ResponseEntity.ok(${serviceVarName}.save(${ent.varName}));\n`;
		out += `\t}\n\n`;

		out += `\t@PutMapping\n`;
		out += `\tpublic ResponseEntity<${ent.className}> update(@RequestBody ${ent.className} ${ent.varName}) {\n`;
		out += `\t\treturn ResponseEntity.ok(${serviceVarName}.update(${ent.varName}));\n`;
		out += `\t}\n\n`;

		// if (ent.id.length === 1){
		// 	out += `\t@PutMapping("/${ent.idPathVars}")\n`;
		// 	out += `\tpublic ResponseEntity<${ent.className}> updateById(@RequestBody ${ent.className} ${ent.varName}, ${ent.idPathArgs}) {\n`;
		// 	ent.id.forEach(pk => {
		// 		out += `\t\t${ent.varName}.setId(${pk.varName});\n`;
		// 	});
		// 	out += `\t\treturn ResponseEntity.ok(${serviceVarName}.update(${ent.varName}));\n`;
		// 	out += `\t}\n\n`;
		// }

		out += `\t@DeleteMapping("/${ent.idPathVars}")\n`;
		out += `\tpublic void deleteById(${ent.idPathArgs}) {\n`;
		out += `\t\t${serviceVarName}.deleteById(${ent.idVars});\n`;
		out += `\t}\n\n`;

		ent.mtmColumns.forEach(col => {
			const listName = plural(col.target.replace("_", "-"));
			out += `\t@GetMapping("/${ent.idPathVars}/${listName}")\n`;
			out += `\tpublic ResponseEntity<List<${col.targetClassName}>> get${plural(col.targetClassName)}(${ent.idPathArgs}) {\n`;
			out += `\t\treturn ResponseEntity.ok(${serviceVarName}.findAll${plural(col.targetClassName)}ById(${ent.idVars}));\n`;
			out += `\t}\n\n`;

			out += `\t@PostMapping("/${ent.idPathVars}/${listName}")\n`;
			out += `\tpublic ResponseEntity<List<${col.targetClassName}>> set${plural(col.targetClassName)}(${ent.idPathArgs}, @RequestBody List<${col.targetClassName}> ${col.targetVarName}) {\n`;
			out += `\t\treturn ResponseEntity.ok(${serviceVarName}.set${plural(col.targetClassName)}ById(${ent.idVars}, ${col.targetVarName}));\n`;
			out += `\t}\n\n`;

			out += `\t@PutMapping("/${ent.idPathVars}/${listName}")\n`;
			out += `\tpublic ResponseEntity<List<${col.targetClassName}>> add${plural(col.targetClassName)}(${ent.idPathArgs}, @RequestBody List<${col.targetClassName}> ${col.targetVarName}) {\n`;
			out += `\t\treturn ResponseEntity.ok(${serviceVarName}.add${plural(col.targetClassName)}ById(${ent.idVars}, ${col.targetVarName}));\n`;
			out += `\t}\n\n`;

			out += `\t@DeleteMapping("/${ent.idPathVars}/${listName}")\n`;
			out += `\tpublic ResponseEntity<List<${col.targetClassName}>> delete${plural(col.targetClassName)}(${ent.idPathArgs}, @RequestBody List<${col.targetClassName}> ${col.targetVarName}) {\n`;
			out += `\t\treturn ResponseEntity.ok(${serviceVarName}.delete${plural(col.targetClassName)}ById(${ent.idVars}, ${col.targetVarName}));\n`;
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
