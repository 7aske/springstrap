export const typeConv = (type: DDLColumnType) => {
	switch (type.datatype) {
		case "text":
		case "varchar":
		case "tinytext":
		case "mediumtext":
		case "longtext":
		case "fulltext":
		case "char":
			return "String";
		case "int":
		case "mediumint":
			// return "Integer";
		case "long":
		case "bigint":
			return "Long";
		case "date":
		case "datetime":
		case "timestamp":
			return "LocalDate";
		case"bool":
		case"boolean":
		case "tinyint":
			return "Boolean";
		case "smallint":
			return "Short";
		case "float":
			return "Float";
		case "decimal":
		case "double":
		case "real":
			return "Double";
		default:
			throw `unknown type '${type.datatype}'`;
	}
};
