import { response, capitalize } from "./utils";
import Method from "./method";
import { FieldVisibility } from "./@types/method/Visibility";

export interface MethodBuilder {

	args(args: string[][]): MethodBuilder;

	arg(arg: string[]): MethodBuilder;

	annotations(annotations: string[]): MethodBuilder;

	annotation(annotation: string): MethodBuilder;

	return(returnType: string): MethodBuilder;

	name(name: string): MethodBuilder;

	visibility(vis: FieldVisibility): MethodBuilder;

	public(): MethodBuilder;

	private(): MethodBuilder;

	protected(): MethodBuilder;

	implementation(impl: string): MethodBuilder;

	build(): Method;
}

export class BasicMethodBuilder implements MethodBuilder {
	protected readonly instance: Method;

	constructor() {
		this.instance = new Method();
	}

	public args(args: string[][]): MethodBuilder {
		this.instance.args.push(...args);
		return this;
	}

	public arg(arg: string[]): MethodBuilder {
		this.instance.args.push(arg);
		return this;
	}

	public annotations(annotations: string[]): MethodBuilder {
		this.instance.annotations.push(...annotations);
		return this;
	}

	public annotation(annotation: string): MethodBuilder {
		this.instance.annotations.push(annotation);
		return this;
	}

	public return(returnType: string): MethodBuilder {
		this.instance.returnType = returnType;
		return this;
	}

	public name(name: string): MethodBuilder {
		this.instance.name = name;
		return this;
	}

	public visibility(vis: FieldVisibility): MethodBuilder {
		this.instance.visibility = vis;
		return this;
	}

	public public(): MethodBuilder {
		return this.visibility(FieldVisibility.PUBLIC);
	}

	public private(): MethodBuilder {
		return this.visibility(FieldVisibility.PRIVATE);
	}

	public protected(): MethodBuilder {
		return this.visibility(FieldVisibility.PROTECTED);
	}

	public implementation(impl: string): MethodBuilder {
		this.instance.implementation = impl;
		return this;
	}

	private static clone(other: Method) {
		return Object.assign(Object.create(Object.getPrototypeOf(other)), other);
	}

	public build(): Method {
		this.validate();
		return BasicMethodBuilder.clone(this.instance);
	}

	protected validate(): void {
		if (!this.instance.name)
			throw new Error("Method instance name is undefined");
	}
}

export class ControllerMethodBuilder extends BasicMethodBuilder {
	constructor() {
		super();
	}

	public return(returnType: string): ControllerMethodBuilder {
		return super.return(response(returnType)) as ControllerMethodBuilder;
	}

	public mapping(method: string, path?: string): ControllerMethodBuilder {
		let pathValue = "";
		if (path) {
			if (!path.startsWith("/")) path = "/" + path;
			pathValue = `("${path}")`;
		}
		return super.annotation(`${capitalize(method.toLowerCase())}Mapping${pathValue}`) as ControllerMethodBuilder;
	}

	public pathVariables(args: string[][]): ControllerMethodBuilder {
		args = args.map(arg => {
			arg.unshift("@PathVariable");
			return arg;
		});
		return super.args(args) as ControllerMethodBuilder;
	}

	public requestBody(args: string[][]): ControllerMethodBuilder {
		args = args.map(arg => {
			arg.unshift("@RequestBody");
			return arg;
		});

		return super.args(args) as ControllerMethodBuilder;
	}

	public requestParam(args: string[][]): ControllerMethodBuilder {
		return super.args(args) as ControllerMethodBuilder;
	}

	public getMapping(path?: string): ControllerMethodBuilder {
		return this.mapping("get", path);
	}

	public postMapping(path?: string): ControllerMethodBuilder {
		return this.mapping("post", path);
	}

	public deleteMapping(path?: string): ControllerMethodBuilder {
		return this.mapping("delete", path);
	}

	public putMapping(path?: string): ControllerMethodBuilder {
		return this.mapping("put", path);
	}


	args(args: string[][]): ControllerMethodBuilder {
		return super.args(args) as ControllerMethodBuilder;
	}

	arg(arg: string[]): ControllerMethodBuilder {
		return super.arg(arg) as ControllerMethodBuilder;
	}

	annotations(annotations: string[]): ControllerMethodBuilder {
		return super.annotations(annotations) as ControllerMethodBuilder;
	}

	annotation(annotation: string): ControllerMethodBuilder {
		return super.annotation(annotation) as ControllerMethodBuilder;
	}

	name(name: string): ControllerMethodBuilder {
		return super.name(name) as ControllerMethodBuilder;
	}

	visibility(vis: FieldVisibility): ControllerMethodBuilder {
		return super.visibility(vis) as ControllerMethodBuilder;
	}

	public(): ControllerMethodBuilder {
		return super.public() as ControllerMethodBuilder;
	}

	private(): ControllerMethodBuilder {
		return super.private() as ControllerMethodBuilder;
	}

	protected(): ControllerMethodBuilder {
		return super.protected() as ControllerMethodBuilder;
	}

	implementation(impl: string): ControllerMethodBuilder {
		return super.implementation(impl) as ControllerMethodBuilder;
	}

	public nickname(value: string, nickname: string): ControllerMethodBuilder {
		return super.annotation(`ApiOperation(value = "${value}", nickname = "${nickname}")`) as ControllerMethodBuilder;
	}

	public defaultNickname(): ControllerMethodBuilder {
		super.validate();
		return this.nickname("", this.instance.name) as ControllerMethodBuilder;
	}

	build(): Method {
		return super.build();
	}
}
