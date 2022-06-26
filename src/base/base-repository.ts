import JavaClass from "../def/JavaClass";
import {uncapitalize} from "../utils";

export default class BaseRepository extends JavaClass {

    public static readonly CLASS_NAME: string = "BaseRepository<T>";

    constructor(options: SpringStrapOptions) {
        super(options.domain, "generic", options);
        super.imports = [
            "org.springframework.data.jpa.repository.*"
        ];
        super.annotations = [
            Exclude.CLASS_NAME
        ];
        super.superClasses = [
            // TODO: Think of a better way for this to be implemented.
            `JpaRepository<T, Integer>`,
        ];

        if (options.specification) {
            super.superClasses.push(`JpaSpecificationExecutor<T>`);
        }

        super.type = "interface";
    }

    get className(): string {
        return BaseRepository.CLASS_NAME;
    }

    get code(): string {
        return this.wrap("");
    }

    get varName(): string {
        return uncapitalize(BaseRepository.CLASS_NAME.substring(0, BaseRepository.CLASS_NAME.length - 3));
    }

    get fileName(): string {
        return `${this.className.substring(0, this.className.length - 3)}.java`;
    }

    get import(): string {
        return `${this.package}.${this.className.substring(0, this.className.length - 3)}`;
    }
}

export class Exclude extends JavaClass {

    public static readonly CLASS_NAME: string = "Exclude";

    constructor(options: SpringStrapOptions) {
        super(options.domain, "generic", options);
    }

    get className(): string {
        return Exclude.CLASS_NAME;
    }

    get code(): string {
        return `package ${this.package};\n\n` +
        "import java.lang.annotation.Documented;\n" +
            "import java.lang.annotation.Retention;\n" +
            "import java.lang.annotation.Target;\n" +
            "\n" +
            "import static java.lang.annotation.ElementType.TYPE;\n" +
            "import static java.lang.annotation.RetentionPolicy.RUNTIME;\n" +
            "\n" +
            "@Retention(RUNTIME)\n" +
            "@Target({TYPE})\n" +
            "@Documented\n" +
            "public @interface Exclude {\n" +
            "}";
    }

    get varName(): string {
        return uncapitalize(Exclude.CLASS_NAME);
    }
}
