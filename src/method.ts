export const enum FieldVisibility {
	PRIVATE="private",
	PROTECTED="protected",
	PUBLIC="public",
	NONE="",
}
export default class Method {
	private readonly _args: string[][] = [];
	private readonly _returnType: string;
	private readonly _name: string;
	private readonly _visibility: FieldVisibility;
	private readonly _implementation?: string;
	constructor(returnType: string, name: string, args:string[][] = [], visibility = FieldVisibility.PUBLIC, implementation?: string) {
		this._returnType = returnType;
		this._name = name;
		this._args = args;
		this._visibility = visibility;
		this._implementation = implementation;

	}

	private static splitArg(arg: string[]): string {
		return arg[0] + " " + arg[1];
	}

	public get code(): string {
		return `${this._visibility} ${this._returnType} ${this._name}(${this._args.map(Method.splitArg).join(", ")});`
	}
}
