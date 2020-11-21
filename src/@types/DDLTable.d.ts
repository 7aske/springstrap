type DDLTable = {
	name: string;
	columns: DDLColumn[];
	primaryKey: DDLPrimaryKey;
	foreignKeys?: DDLForeignKey[];
	options?: DDLTableOptions;
}

type DDLTableOptions = {
	comment: string;
}
