import JavaClass from "../def/JavaClass";
import {uncapitalize} from "../utils";

export default class BaseService extends JavaClass {

    public static readonly CLASS_NAME: string = "BaseService<T>";

    constructor(options: SpringStrapOptions) {
        super(options.domain, "generic", options);
        super.imports = [
            "java.util.List"
        ];
        super.type = "interface";

        // @Optimization: Jesus Christ...
        if (this.options.specification && this.options.sort && this.options.pageable) {
            super.imports.push("org.springframework.data.jpa.domain.Specification");
            super.imports.push("org.springframework.data.domain.Sort");
            super.imports.push("org.springframework.data.domain.Pageable");
        } else if (this.options.specification && this.options.sort && !this.options.pageable) {
            super.imports.push("org.springframework.data.jpa.domain.Specification");
            super.imports.push("org.springframework.data.domain.Sort");
        } else if (this.options.specification && !this.options.sort && !this.options.pageable) {
            super.imports.push("org.springframework.data.jpa.domain.Specification");
        } else if (this.options.specification && !this.options.sort && this.options.pageable) {
            super.imports.push("org.springframework.data.jpa.domain.Specification");
            super.imports.push("org.springframework.data.domain.Pageable");
        } else if (!this.options.specification && this.options.sort && this.options.pageable) {
            super.imports.push("org.springframework.data.domain.Sort");
            super.imports.push("org.springframework.data.domain.Pageable");
        } else if (!this.options.specification && !this.options.sort && this.options.pageable) {
            super.imports.push("org.springframework.data.domain.Pageable");
        } else if (!this.options.specification && this.options.sort && !this.options.pageable) {
            super.imports.push("org.springframework.data.domain.Sort");
        }
    }

    get className(): string {
        return BaseService.CLASS_NAME;
    }

    get code(): string {
        let code = "\n";

        if (this.options.specification && this.options.sort && this.options.pageable)
            code += `\tList<T> findAll(Specification<T> specification, Pageable pageable, Sort sort);\n\n`;
        else if (this.options.specification && this.options.sort && !this.options.pageable)
            code += `\tList<T> findAll(Specification<T> specification, Sort sort);\n\n`;
        else if (this.options.specification && !this.options.sort && !this.options.pageable)
            code += `\tList<T> findAll(Specification<T> specification);\n\n`;
        else if (this.options.specification && !this.options.sort && this.options.pageable)
            code += `\tList<T> findAll(Specification<T> specification, Pageable pageable);\n\n`;
        else if (!this.options.specification && !this.options.sort && this.options.pageable)
            code += `\tList<T> findAll(Pageable pageable);\n\n`;
        else if (!this.options.specification && this.options.sort && !this.options.pageable)
            code += `\tList<T> findAll(Sort sort);\n\n`;
        else
            code += `\tList<T> findAll();\n\n`;
        code += `\tT save(T t);\n\n`;
        code += `\tT update(T t);\n\n`;
        code += `\tT findById(Integer id);\n`;
        code += `\n\tvoid deleteById(Integer id);\n`;

        return this.wrap(code);
    }

    get varName(): string {
        return uncapitalize(BaseService.CLASS_NAME.substring(0, BaseService.CLASS_NAME.length - 3));
    }

    get fileName(): string {
        return `${this.className.substring(0, this.className.length - 3)}.java`;
    }

    get import(): string {
        return `${this.package}.${this.className.substring(0, this.className.length - 3)}`;
    }
}
