import { DEFAULT_SSOPT, strlenCompareTo, fold } from "../utils";

export default abstract class JavaClass {
	private readonly _domain: string;
	private readonly _options: SpringStrapOptions;
	private readonly _packageName: string;
	private _annotations: string[];
	private _imports: string[];
	private _interfaces: string[];
	private _superClasses: string[];
	private _type: ClassType = "class";
	private _comment?: string = undefined;
	private _abstract: boolean = false;
	private static readonly LOMBOK_IMPORTS = [
		"lombok.*",
	];
	private static readonly LOMBOK_ANNOTATIONS = [
		"Data",
		`EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)`,
		"NoArgsConstructor",
	];

	protected constructor(domain: string,
	                      packageName: string,
	                      options = DEFAULT_SSOPT,
	                      imports: string[] = [],
	                      annotations: string[] = [],
	                      interfaces: string[] = [],
	                      superClasses: string[] = []) {
		this._domain = domain;
		this._options = Object.assign({}, options);
		this._packageName = packageName;
		this._interfaces = interfaces;
		this._imports = imports;
		this._superClasses = superClasses;
		this._annotations = annotations;
	}

	public abstract get code(): string;

	public abstract get className(): string;

	public abstract get varName(): string;

	protected wrap(classImpl: string = "", attr = ""): string {
		if (this.options.lombok && this._type !== "interface") {
			this._imports.push(...JavaClass.LOMBOK_IMPORTS);
			this._annotations.push(...JavaClass.LOMBOK_ANNOTATIONS);
		}
		if (this.options.auditable && this._type !== "interface") {
			this._interfaces.splice(this._interfaces.indexOf("Serializable"), 1);
			this._imports.splice(this._imports.indexOf("java.io.Serializable"), 1);
			this._superClasses.push("Auditable");
		}
		if (this.annotations.indexOf("RequiredArgsConstructor") !== -1) {
			this.annotations.splice(this.annotations.indexOf("NoArgsConstructor"), 1);
		}

		let out = `package ${this.package};\n\n`;
		out += JavaClass.formatImports(this._imports);
		if (this.comment){
			out += "/**\n";
			out += `${fold(this.comment).split("\n").map(line => ` * ${line}\n`).join("")}`
			 out += " */\n";
		}

		out += JavaClass.formatAnnotations(this._annotations);
		out += `public${this._abstract ? " abstract " : " "}${this._type} ${this.className}`;
		if (this._superClasses.length > 0) out += " extends " + this._superClasses.join(", ");
		if (this._interfaces.length > 0) out += " implements " + this._interfaces.join(", ");
		out += ` {\n`;
		out += attr;
		if (!this._options.lombok) {
			if (this.type === "enum"){
				out += "\n\tprivate final String name;\n";
				out += `\n\t${this.className}(String name) {\n\t\tthis.name = name;\n\t}\n`;
				out += `\n\tpublic String getName() {\n\t\treturn name;\n\t}\n`;
			} else if (!this.package.endsWith("config") && this.type !== "interface" && this.className !== "Auditable") {
				out += `\n\t${this.className}() {}\n`;
			}
		}
		out += classImpl;
		out += `\n}`;

		return out;
	}

	public get fileName(): string {
		return `${this.className}.java`;
	}

	protected set lombok(val: boolean) {
		this._options.lombok = val;
	}

	protected set auditable(val: boolean) {
		this._options.auditable = val;
	}


	get type(): ClassType {
		return this._type;
	}

	set type(value: ClassType) {
		this._type = value;
	}

	public get package(): string {
		if (!this._domain) return `${this._packageName}`;
		return `${this._domain}.${this._packageName}`;
	}

	public get import() {
		if (!this._domain) return `${this._packageName}.${this.className}`;
		return `${this._domain}.${this._packageName}.${this.className}`;
	}

	public get domain(): string {
		return this._domain;
	}

	public get options(): SpringStrapOptions {
		return this._options;
	}

	protected static formatImports(imports: string[]): string {
		return `${imports.sort().map(imp => `import ${imp};\n`).join("")}\n`;
	};

	protected static formatAnnotations(annotations: string[]): string {
		return `${annotations.sort(strlenCompareTo).map(anno => `@${anno}\n`).join("")}`;
	};


	protected get annotations(): string[] {
		return this._annotations;
	}

	protected set annotations(value: string[]) {
		this._annotations = value;
	}

	protected get imports(): string[] {
		return this._imports;
	}

	protected set imports(value: string[]) {
		this._imports = value;
	}

	protected get interfaces(): string[] {
		return this._interfaces;
	}

	protected set interfaces(value: string[]) {
		this._interfaces = value;
	}

	protected get superClasses(): string[] {
		return this._superClasses;
	}

	protected set superClasses(value: string[]) {
		this._superClasses = value;
	}

	get comment(): string {
		return this._comment ?? "";
	}

	set comment(value: string) {
		this._comment = value;
	}

	get abstract(): boolean {
		return this._abstract;
	}

	set abstract(value: boolean) {
		this._abstract = value;
	}
}
