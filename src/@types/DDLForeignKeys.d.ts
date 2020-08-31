type DDLForeignKeysReference = {
	table: string;
	on: {trigger: string, action: string}[];
	columns: {column: string}[];
}
type DDLForeignKey = {
	name: string;
	reference: DDLForeignKeysReference;
	columns: {column: string}[];
}

