type DDLColumnType = {
	datatype: DDLType;
	width?: number;
	length?: number;
	fractional?: boolean;
	digits?: number;
	decimals?: number
}
type DDLColumnOptions = {
	nullable?: boolean;
	autoincrement?: boolean;
	default?: any;
}

type DDLColumn = {
	name: string;
	type: DDLColumnType;
	options: DDLColumnOptions;
}
