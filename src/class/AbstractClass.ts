import Field from "./Field";
import { strlenCompareTo } from "../utils";

export default abstract class AbstractClass {
	private readonly _package: string;
	private readonly _name: string;
	private readonly _type: ClassType;
	private readonly _accessor: AccessorType;
	private readonly _static: boolean;
	private _annotations: string[];
	private _fields: Field[];
	private _imports: string[];
	private _interfaces: string[];
	private _superClasses: string[];

	public constructor(pkg: string, name: string, accessor: AccessorType = "public", type: ClassType = "class") {
		this._package = pkg;
		this._name = name;
		this._type = type;
		this._accessor = accessor;
		this._static = false;
		this._annotations = [];
		this._fields = [];
		this._imports = [];
		this._interfaces = [];
		this._superClasses = [];
	}

	public abstract code(): string;

	public wrap(impl = ""): string {
		let out = `package ${this._package};\n\n`;
		out += AbstractClass.formatImports(this._imports);
		out += AbstractClass.formatAnnotations(this._annotations);
		out += `${this._accessor} ${this._type} ${this._name}`;
		if (this._superClasses.length > 0) out += " extends " + this._superClasses.join(", ");
		if (this._interfaces.length > 0) out += " implements " + this._interfaces.join(", ");
		out += ` {\n`;
		out += impl;
		out += `\n}`;

		return out;
	}

	protected static formatImports(imports: string[]): string {
		return `${imports.sort().map(imp => `import ${imp};\n`).join("")}\n`;
	};

	protected static formatAnnotations(annotations: string[]): string {
		return `${annotations.sort(strlenCompareTo).map(anno => `@${anno}\n`).join("")}`;
	};

	public get import(): string {
		return `${this._package}.${this._name}`
	}

	public get package(): string {
		return this._package;
	}

	public get name(): string {
		return this._name;
	}

	public get annotations(): string[] {
		return this._annotations;
	}

	public set annotations(value: string[]) {
		this._annotations = value;
	}

	public get fields(): Field[] {
		return this._fields;
	}

	public set fields(value: Field[]) {
		this._fields = value;
	}

	public get imports(): string[] {
		return this._imports;
	}

	public set imports(value: string[]) {
		this._imports = value;
	}

	public get interfaces(): string[] {
		return this._interfaces;
	}

	public set interfaces(value: string[]) {
		this._interfaces = value;
	}

	get superClasses(): string[] {
		return this._superClasses;
	}

	set superClasses(value: string[]) {
		this._superClasses = value;
	}
}

