import FieldVisibility from "./Visbility";

export interface MethodBuilder {

}

export default class Method {
	private _args: string[][] = [];
	private _returnType: string;
	private _name: string;
	private _visibility: FieldVisibility;
	private _implementation: string;
	private _annotations: string[];


	constructor() {
		this._returnType = "void";
		this._visibility = FieldVisibility.PUBLIC;
		this._implementation = "";
		this._args = [];
		this._annotations = [];
	}

	get args(): string[][] {
		return this._args;
	}

	set args(value: string[][]) {
		this._args = value;
	}

	get returnType(): string {
		return this._returnType;
	}

	set returnType(value: string) {
		this._returnType = value;
	}

	get name(): string {
		return this._name;
	}

	set name(value: string) {
		this._name = value;
	}

	get visibility(): FieldVisibility {
		return this._visibility;
	}

	set visibility(value: FieldVisibility) {
		this._visibility = value;
	}

	get implementation(): string {
		return this._implementation;
	}

	set implementation(value: string) {
		this._implementation = value;
	}

	get annotations(): string[] {
		return this._annotations;
	}

	set annotations(value: string[]) {
		this._annotations = value;
	}

	private static splitArg(arg: string[]): string {
		return arg[0] + " " + arg[1];
	}

	public get code(): string {
		return `${this._visibility} ${this._returnType} ${this._name}(${this._args.map(Method.splitArg).join(", ")});`;
	}

	public generate(): string {
		const args = this.args
			.map(arg => `${arg.join(" ")}`)
			.join(", ");
		const annos = this.annotations
			.map(anno => `\t@${anno}\n`)
			.sort((a, b) => a.length - b.length)
			.join("");

		let out = "";
		out += annos;
		out += `\t${this.visibility} ${this.returnType} ${this.name}(${args}) {\n`;
		out += `\t${this.implementation}`;
		out += `\t}\n\n`;
		return out;
	}
}
