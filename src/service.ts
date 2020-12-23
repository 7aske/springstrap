import Entity from "./entity";
import { uncapitalize, plural } from "./utils";
import JavaClass from "./def/JavaClass";


export default class Service extends JavaClass{
	private readonly _entity: Entity;
	private readonly _className: string;

	constructor(entity: Entity, domain: string) {
		super(domain, "service");
		super.imports= [
			`${domain}.entity.*`,
			`java.util.List`,
			`java.util.Collection`,
		]
		super.type = "interface";

		this._className = entity.className + "Service";
		this._entity = entity;
	}

	public get code(): string {
		const ent = this._entity;

		let code = "\n";
		code += `\tList<${ent.className}> findAll();\n\n`;
		code += `\t${ent.className} save(${ent.className} ${ent.varName});\n\n`;
		code += `\t${ent.className} update(${ent.className} ${ent.varName});\n\n`;
		code += `\t${ent.className} findById(${ent.idArgs});\n`;
		code += `\n\tvoid deleteById(${ent.idArgs});\n`;
		this.entity.mtmColumns.forEach(col => {
			code += `\n\tList<${col.targetClassName}> findAll${plural(col.targetClassName)}ById(${ent.idArgs});\n`;
			code += `\n\tList<${col.targetClassName}> add${plural(col.targetClassName)}ById(${ent.idArgs}, List<${col.targetClassName}> ${col.targetVarName});\n`;
			code += `\n\tList<${col.targetClassName}> set${plural(col.targetClassName)}ById(${ent.idArgs}, List<${col.targetClassName}> ${col.targetVarName});\n`;
			code += `\n\tList<${col.targetClassName}> delete${plural(col.targetClassName)}ById(${ent.idArgs}, List<${col.targetClassName}> ${col.targetVarName});\n`;
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

