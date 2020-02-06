const {nameConv, typeConv} = require("./utils");

class Column {
	constructor({name, type, options}, {foreignKey, primaryKey}) {
		this.name = name;
		this.className = nameConv(name, true);
		this.type = type;
		this.options = options;
		this.foreignKey = foreignKey;
		this.primaryKey = primaryKey;
	}

	toString() {
		let out = "";
		let varname = nameConv(this.name);
		let type = this.getType();
		if (this.primaryKey) {
			out += "\t@Id\n";
			out += "\t@GeneratedValue(strategy = GenerationType.IDENTITY)\n";
			out += `\t@Column(name = "${this.name}")\n`;
			out += `\tpublic ${type} ${varname};\n`;
		} else if (this.foreignKey) {
			out += `\t@JoinColumn(name = "${this.name}", referencedColumnName = "${this.foreignKey.reference.columns[0].column}")\n`;
			out += `\t@ManyToOne\n`;
			out += `\tpublic ${nameConv(this.foreignKey.reference.table, true)} ${varname};\n`;
		} else {
			out += `\t@Column(name = "${this.name}")\n`;
			out += `\tpublic ${type} ${varname};`;
		}
		return out;
	}

	getType(){
		if (this.primaryKey) {
			return "Long";
		} else if (this.foreignKey) {
			return nameConv(this.foreignKey.reference.table, true);
		} else {
			return typeConv(this.type);
		}
	}

	getter() {
		let varname = nameConv(this.name);
		let cVarname = varname.charAt(0).toUpperCase() + varname.substring(1);
		let type = this.getType();
		let out = "";
		out += `\tpublic ${type} get${cVarname}() {\n`;
		out += `\t\treturn ${varname};\n`;
		out += `\t}\n\n`;
		return out;
	}

	setter() {
		let varname = nameConv(this.name);
		let cVarname = varname.charAt(0).toUpperCase() + varname.substring(1);
		let type = this.getType();
		let out = "";
		out += `\tpublic void set${cVarname}(${type} ${varname}) {\n`;
		out += `\t\tthis.${varname} = ${varname};\n`;
		out += `\t}\n\n`;
		return out;
	}
}

module.exports = Column;
