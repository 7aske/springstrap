import JavaClass from "../def/JavaClass";
import BaseService from "./base-service";
import BaseRepository from "./base-repository";
import {DEFAULT_SSOPT, uncapitalize} from "../utils";

export default class BaseServiceImpl extends JavaClass {

    private readonly _baseService: BaseService;
    private readonly _baseRepository: BaseRepository;
    private static readonly CLASS_NAME: string = "BaseServiceImpl<T>";

    constructor(baseService: BaseService, baseRepository: BaseRepository, domain: string, options: SpringStrapOptions = DEFAULT_SSOPT) {
        super(domain, "generic", options);
        this._baseRepository = baseRepository;
        this._baseService = baseService;
        super.imports = [
            baseRepository.import,
            baseService.import,
            "java.util.NoSuchElementException",
            "java.util.List",
        ];
        super.interfaces = [
            baseService.className
        ];

        if (options.lombok) {
            super.imports.push("lombok.*");
        }

        const lombokAnnotations = [
            "RequiredArgsConstructor(access = AccessLevel.PROTECTED)",
            "Getter(AccessLevel.PROTECTED)"
        ];

        const noLombokImports = [
            "org.springframework.beans.factory.annotation.Autowired",
        ];

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
        } else if (!this.options.specification && !this.options.sort && this.options.pageable) {
            super.imports.push("org.springframework.data.domain.Pageable");
        } else if (!this.options.specification && this.options.sort && !this.options.pageable) {
            super.imports.push("org.springframework.data.domain.Sort");
        }

        super.auditable = false;
        if (this.options.lombok) super.annotations.push(...lombokAnnotations);
        if (this.options.lombok) super.imports.push("lombok.RequiredArgsConstructor");
        if (!this.options.lombok) super.imports.push(...noLombokImports);
    }

    public get baseService(): BaseService {
        return this._baseService;
    }

    public get baseRepository(): BaseRepository {
        return this._baseRepository;
    }

    get className(): string {
        return BaseServiceImpl.CLASS_NAME;
    }

    get code(): string {
        let code = "";
        if (this.options.lombok) {
            code += `\tprotected final ${this.baseRepository.className} ${this.baseRepository.varName};\n\n`;
        } else {
            code += "\t@Autowired\n";
            code += `\tprotected ${this.baseRepository.className} ${this.baseRepository.varName};\n\n`;
        }

        if (this.options.specification && this.options.sort && this.options.pageable) {
            code += "\t@Override\n";
            code += `\tpublic List<T> findAll(Specification<T> specification, Pageable pageable, Sort sort) {\n`;
            code += "\t\tif (pageable == null)";
            code += `\t\t\treturn ${this.baseRepository.varName}.findAll(specification, sort == null ? Sort.unsorted() : sort);\n`;
            code += `\t\treturn ${this.baseRepository.varName}.findAll(specification, pageable).toList();\n`;
            code += "\t}\n\n";
        } else if (this.options.specification && this.options.sort && !this.options.pageable) {
            code += "\t@Override\n";
            code += `\tpublic List<T> findAll(Specification<T> specification, Sort sort) {\n`;
            code += `\t\treturn ${this.baseRepository.varName}.findAll(specification, sort == null ? Sort.unsorted() : sort);\n`;
            code += "\t}\n\n";
        } else if (this.options.specification && !this.options.sort && !this.options.pageable) {
            code += "\t@Override\n";
            code += `\tpublic List<T> findAll(Specification<T> specification) {\n`;
            code += `\t\treturn ${this.baseRepository.varName}.findAll(specification);\n`;
            code += "\t}\n\n";
        } else if (this.options.specification && !this.options.sort && this.options.pageable) {
            code += "\t@Override\n";
            code += `\tpublic List<T> findAll(Specification<T> specification, Pageable pageable) {\n`;
            code += `\t\treturn ${this.baseRepository.varName}.findAll(specification, pageable).toList();\n`;
            code += "\t}\n\n";
        } else if (!this.options.specification && !this.options.sort && this.options.pageable) {
            code += "\t@Override\n";
            code += `\tpublic List<T> findAll(Pageable pageable) {\n`;
            code += `\t\treturn ${this.baseRepository.varName}.findAll(pageable).toList();\n`;
            code += "\t}\n\n";
        } else if (!this.options.specification && this.options.sort && !this.options.pageable) {
            code += "\t@Override\n";
            code += `\tpublic List<T> findAll(Sort sort) {\n`;
            code += `\t\treturn ${this.baseRepository.varName}.findAll(sort);\n`;
            code += "\t}\n\n";
        } else {
            code += "\t@Override\n";
            code += `\tpublic List<T> findAll() {\n`;
            code += `\t\treturn ${this.baseRepository.varName}.findAll();\n`;
            code += "\t}\n\n";
        }

        code += "\t@Override\n" +
            "    \tpublic T findById(Integer id) {\n" +
            "    \t\treturn baseRepository.findById(id)\n" +
            "    \t\t\t.orElseThrow(() -> new NoSuchElementException(\"Entity with this id \" + id + \"doesn't exist.\"));\n" +
            "    \t}\n\n";

        code += "\t@Override\n" +
            "    \tpublic T save(T t) {\n" +
            "    \t\treturn baseRepository.save(t);\n" +
            "    \t}\n\n";


        code += "\t@Override\n" +
            "    \tpublic T update(T t) {\n" +
            "    \t\treturn baseRepository.save(t);\n" +
            "    \t}\n\n";

        code += "\t@Override\n" +
            "    \tpublic void deleteById(Integer id) {\n" +
            "    \t\tbaseRepository.deleteById(id);\n" +
            "    \t}\n\n";

        return this.wrap(code);
    }

    get varName(): string {
        return uncapitalize(this.baseService.className);
    }

    get fileName(): string {
        return `${this.className.substring(0, this.className.length - 3)}.java`;
    }
}
