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
		case "smallint":
		case "int":
		case "mediumint":
			if (type.width === 1) return "Boolean"
			return "Integer";
		case "long":
		case "bigint":
			if (type.width === 1) return "Boolean"
			return "Long";
		case "date":
			return "LocalDate"
		case "datetime":
		case "timestamp":
		case "time":
			return "LocalDateTime";
		case "bool":
		case  "boolean":
		case "tinyint":
			return "Boolean";
		case "float":
		case "decimal":
		case "double":
		case "real":
			return "Double";
		default:
			throw `unknown type '${type.datatype}'`;
	}
};
