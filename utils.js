typeConv = (type) => {
	switch (type.datatype) {
		case "text":
		case "varchar":
		case "tinytext":
		case "mediumtext":
		case "fulltext":
			return "String";
		case "int":
			return "int";
		case "long":
		case "bigint":
		case "mediumint":
			return "long";
		case "date":
		case "datetime":
		case "timestamp":
			return "LocalDate";
		case"bool":
		case"boolean":
			return "boolean";
		case "smallint":
			return "short";
		case "character":
		case "char":
		case "tinyint":
			return "char";
		case "float":
		case "double":
		case "real":
			return "double";
		default:
			console.error(`unknown type '${type.datatype}'`);
			process.exit(2);
	}
};

const nameConv = (name, clss) => {
	for (let i = 0; i < name.length; i++) {
		if (name[i] === "_") {
			name = name.substring(0, i) + name.charAt(i + 1).toUpperCase() + name.substring(i + 2);

		}
	}
	if (clss) {
		return name.charAt(0).toUpperCase() + name.substring(1);

	} else {
		return name;
	}
};

module.exports = {nameConv, typeConv};
