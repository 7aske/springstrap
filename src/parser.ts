const Parser = require("sql-ddl-to-json-schema");

export const parseDDL = (sql: string, type: string): DDLTable[] => {
	const parser = new Parser(type);

	sql = sql.replace(/^--.*$/mg, "");
	sql = sql.replace(/^INSERT.+$/mgi, "");
	sql = sql.replace(/^SET.+$/mgi, "");
	sql = sql.replace(/^\/\*.+$/mgi, "");
	sql = sql.replace(/^\(.+$/mgi, "");
	sql = sql.replace(/^DROP.+$/mgi, "");
	sql = sql.replace(/^CREATE DATABASE.+$/mgi, "");
	sql = sql.replace(/^CREATE VIEW.+$/mgi, "");
	sql = sql.replace(/^CRATE USER.+$/mgi, "");
	sql = sql.replace(/^GRANT.+$/mgi, "");
	sql = sql.replace(/^USE.+$/mgi, "");
	sql = sql.replace(/ real /mgi, " double ");

	parser.feed(sql);

	const parsedJsonFormat = parser.results;
	return parser.toCompactJson(parsedJsonFormat);
};
