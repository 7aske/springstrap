type DDLTable = {
	name: string;
	columns: DDLColumn[];
	primaryKey: DDLPrimaryKey;
	foreignKeys?: DDLForeignKey[];
}
