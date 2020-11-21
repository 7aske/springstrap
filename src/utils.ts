export const snakeToCamel = (name: string, toCapitalize = false) => {
	for (let i = 0; i < name.length; i++) {
		if (name[i] === "_") {
			name = name.substring(0, i) + name.charAt(i + 1).toUpperCase() + name.substring(i + 2);

		}
	}
	if (toCapitalize) {
		return capitalize(name);
	} else {
		return name;
	}
};

export const capitalize = (str: string): string =>
	str.charAt(0).toUpperCase() + str.substring(1);

export const uncapitalize = (str: string): string =>
	str.charAt(0).toLowerCase() + str.substring(1);

export const plural = (str: string) => {
	if (str.endsWith("s")) return str + "es";
	if (str.endsWith("x")) return str + "es";
	if (str.endsWith("y")) return str.substring(0, str.length - 1) + "ies";
	return str + "s";
};

/**
 * Checks if the provided table's sole purpose is to provide a many-to-many relationship
 * @param table
 */
export const isRelation = (table: DDLTable): boolean => {
	return table.foreignKeys !== undefined && table.primaryKey !== undefined &&
		table.columns.length === table.foreignKeys.length &&
		table.primaryKey.columns.length === table.foreignKeys.length;
};

export const DEFAULT_SSOPT: SpringStrapOptions = {
	output: "./",
	type: "mariadb",
	domain: "",
};

export const formatImports = (imports: string[]): string => {
	return `${imports.sort()
		.map(imp => `import ${imp};\n`)
		.join("")}\n`;
};

export const formatAnnotations = (annotations: string[]): string => {
	return `${annotations.map(anno => `@${anno}\n`).join("")}`;
};

export const strlenCompareTo = (a: string, b: string): number => {
	return numCompareTo(a.length, b.length);
};

export const numCompareTo = (a: number, b: number): number => {
	if (a > b) return 1;
	if (a < b) return -1;
	return 0;
};

export const fold = (str: string, len = 80): string => {
	if (len <= 0) throw new Error("Invalid fold length " + len);
	if (str.length <= len) return str;

	const openParen = ["(","[", "{"];
	const closedParen = [")","]", "}"];
	let parenCount = 0;
	let count = 0;
	let out = "";
	str.split("").forEach((c) => {
		if (c in openParen) parenCount ++;
		if (c in closedParen) parenCount --;
		if (count / len > 1 && c === " " && parenCount <= 0) {
			out += "\n";
			count = 0;
		} else {
			out += c;
		}
		count++;
	});
	return out;
};

