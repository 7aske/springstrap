import Entity from "./entity";
import { uncapitalize, formatImports, plural } from "./utils";
import JavaClass from "./def/JavaClass";


export default class Service extends JavaClass{
	private readonly _entity: Entity;
	private readonly _className: string;

	constructor(entity: Entity, domain: string) {
		super(domain, "service");
		super.imports= [
			`${domain}.entity.*`,
			`java.util.List`,
		]
		super.type = "interface";

		this._className = entity.className + "Service";
		this._entity = entity;
	}

	public get code(): string {
		const entity = this._entity;

		let code = "\n";
		code += `\tList<${entity.className}> findAll();\n\n`;
		code += `\t${entity.className} save(${entity.className} ${entity.varName});\n\n`;
		code += `\t${entity.className} update(${entity.className} ${entity.varName});\n\n`;
		code += `\t${entity.className} findById(${this.entity.id.javaType} ${this.entity.id.varName});\n`;
		code += `\n\tvoid deleteById(${this.entity.id.javaType} ${this.entity.id.varName});\n`;
		this.entity.mtmColumns.forEach(col => {
			code += `\n\tList<${col.targetClassName}> findAll${plural(col.targetClassName)}By${entity.id.className}(${entity.id.javaType} ${entity.id.varName});\n`;
			// out += `\n\tList<${col.className}> findAllBy${capitalize(col.targetVarName)}(${""});\n`;
		});

		return this.wrap(code);
	}

	public get className(): string {
		return this._className;
	}

	public get varName(): string{
		return uncapitalize(this.className);
	}

	public get entity(): Entity {
		return this._entity;
	}
}

