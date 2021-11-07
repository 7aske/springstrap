import Entity from "./entity";
import { uncapitalize } from "./utils";
import { BasicMethodBuilder } from "./methodBuilder";

export default class EmbeddedId {
	private _entity: Entity;
	private _options: SpringStrapOptions;

	constructor(entity: Entity, options: SpringStrapOptions) {
		this._entity = entity;
		this._options = options;
	}

	get className(): string {
		return  this._entity.className + "Id";
	}

	get code(): string {
		let code = "";

		if (this._options.lombok) {
			code += "\t@Data\n"
			code += "\t@AllArgsConstructor\n"
			code += "\t@NoArgsConstructor\n"
		}
		code += "\t@Embeddable\n"
		code += `\tpublic static final class ${this.className} implements java.io.Serializable {\n\t\t`
		code += `${this._entity.columns.filter(c => c.primaryKey).map(col => `${col.code.split("\n").join("\n\t\t")}`).join("")}`;

		if (!this._options.lombok) {
			code += `\n\t\tpublic ${this.className}() {\n`
			code += "\n\t\t}\n\n"
			code += `\t\tpublic ${this.className}(${this._entity.columns.filter(c => c.primaryKey).map(c => `${c.javaType} ${c.varName}`).join(", ")}) {\n`
			code += this._entity.columns.filter(c => c.primaryKey).map(c => `\t\t\tthis.${c.varName} = ${c.varName};`).join("\n");
			code += "\n\t\t}\n"
		}

		code += "\n\t"
		code += new BasicMethodBuilder()
			.annotation("Override")
			.public()
			.return("boolean")
			.name("equals")
			.arg(["Object", "o"])
			.implementation(`\tif (this == o) return true;\n\t\tif (o == null || getClass() != o.getClass()) return false;\n\t\t${this.className} ${this.varName} = (${this.className}) o;\n\t\treturn ${this._entity.id.map(id => `${id.varName}.equals(${this.varName}.${id.varName})`).join(" && ")};\n`)
			.build()
			.generate()
			.split("\n")
			.join("\n\t");

		code += "\n\t"
		code += new BasicMethodBuilder()
			.annotation("Override")
			.public()
			.return("int")
			.name("hashCode")
			.implementation(`\treturn Objects.hash(${this._entity.id.map(id => `${id.varName}`).join(", ")});\n`)
			.build()
			.generate()
			.split("\n")
			.join("\n\t");

		code += "\n\t}\n"

		return code;
	}

	get varName(): string {
		return uncapitalize(this.className);
	}


}
