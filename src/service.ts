import Entity from "./entity";
import { uncapitalize, plural } from "./utils";
import JavaClass from "./def/JavaClass";


export default class Service extends JavaClass{
	private readonly _entity: Entity;
	private readonly _className: string;

	constructor(entity: Entity, options: SpringStrapOptions) {
		super(options.domain, "service", options);
		super.imports= [
			`${options.domain}.entity.*`,
			`java.util.List`,
			`java.util.Collection`,
		];

		if (this.options.base) {
			super.imports.push(`${options.domain ? options.domain + "." : ""}generic.*`);
			super.superClasses = [
				`BaseService<${entity.className}>`
			];
		}

		if (this.options.specification && this.options.sort && this.options.pageable) {
			super.imports.push("org.springframework.data.jpa.domain.Specification");
			super.imports.push("org.springframework.data.domain.Sort");
			super.imports.push("org.springframework.data.domain.Pageable");
		} else if (this.options.specification && this.options.sort && !this.options.pageable) {
			super.imports.push("org.springframework.data.jpa.domain.Specification");
			super.imports.push("org.springframework.data.domain.Sort");
		} else if (this.options.specification && !this.options.sort && !this.options.pageable) {
			super.imports.push("org.springframework.data.jpa.domain.Specification");
		} else if (this.options.specification && !this.options.sort && this.options.pageable) {
			super.imports.push("org.springframework.data.jpa.domain.Specification");
			super.imports.push("org.springframework.data.domain.Pageable");
		} else if (!this.options.specification && this.options.sort && this.options.pageable) {
			super.imports.push("org.springframework.data.domain.Sort");
			super.imports.push("org.springframework.data.domain.Pageable");
		} else if (!this.options.specification && !this.options.sort && this.options.pageable) {
			super.imports.push("org.springframework.data.domain.Pageable");
		} else if (!this.options.specification && this.options.sort && !this.options.pageable) {
			super.imports.push("org.springframework.data.domain.Sort");
		}

		super.type = "interface";
		this._className = entity.className + "Service";
		this._entity = entity;
	}

	public get code(): string {
		const ent = this._entity;

		let code = "\n";
		if (!this.options.base) {
			if (this.options.specification && this.options.sort && this.options.pageable)
				code += `\tList<${ent.className}> findAll(Specification<${ent.className}> specification, Pageable pageable, Sort sort);\n\n`;
			else if (this.options.specification && this.options.sort && !this.options.pageable)
				code += `\tList<${ent.className}> findAll(Specification<${ent.className}> specification, Sort sort);\n\n`;
			else if (this.options.specification && !this.options.sort && !this.options.pageable)
				code += `\tList<${ent.className}> findAll(Specification<${ent.className}> specification);\n\n`;
			else if (this.options.specification && !this.options.sort && this.options.pageable)
				code += `\tList<${ent.className}> findAll(Specification<${ent.className}> specification, Pageable pageable);\n\n`;
			else if (!this.options.specification && !this.options.sort && this.options.pageable)
				code += `\tList<${ent.className}> findAll(Pageable pageable);\n\n`;
			else if (!this.options.specification && this.options.sort && !this.options.pageable)
				code += `\tList<${ent.className}> findAll(Sort sort);\n\n`;
			else
				code += `\tList<${ent.className}> findAll();\n\n`;
			code += `\t${ent.className} save(${ent.className} ${ent.varName});\n\n`;
			code += `\t${ent.className} update(${ent.className} ${ent.varName});\n\n`;
			code += `\t${ent.className} findById(${ent.idArgsString});\n`;
			code += `\n\tvoid deleteById(${ent.idArgsString});\n`;
			this.entity.mtmColumns.forEach(col => {
				code += `\n\tList<${col.targetClassName}> findAll${plural(col.targetClassName)}ById(${ent.idArgsString});\n`;
				code += `\n\tList<${col.targetClassName}> add${plural(col.targetClassName)}ById(${ent.idArgsString}, List<${col.targetClassName}> ${col.targetVarName});\n`;
				code += `\n\tList<${col.targetClassName}> set${plural(col.targetClassName)}ById(${ent.idArgsString}, List<${col.targetClassName}> ${col.targetVarName});\n`;
				code += `\n\tList<${col.targetClassName}> delete${plural(col.targetClassName)}ById(${ent.idArgsString}, List<${col.targetClassName}> ${col.targetVarName});\n`;
			});
		}
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

