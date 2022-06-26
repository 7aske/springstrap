import JavaClass from "../def/JavaClass";
import { uncapitalize } from "../utils";

export default class PageableConverter extends JavaClass {

    public static readonly CLASS_NAME: string = "PageableConverter";

    constructor(domain: string, options: SpringStrapOptions) {
        super(domain, "bean.converter", options);
    }

    get className(): string {
        return PageableConverter.CLASS_NAME;
    }

    get code(): string {
        return `package ${this.package};

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
public class PageableConverter implements Converter<String, Pageable> {
    public static final int DEFAULT_PAGE_SIZE = 10;
    private Integer pageSize;

    @Override
    public Pageable convert(String queryString) {
        if (queryString.isEmpty())
            return null;

        String[] attrs = queryString.split(",");

        return PageRequest.of(
                parsePageNumber(attrs),
                parsePageSize(attrs),
                parseSort(attrs)
        );
    }

    private Sort parseSort(String[] attrs) {
        if (attrs.length <= 1)
            return Sort.unsorted();

        String attr;
        if (attrs.length == 3)
            attr = attrs[2];
        else
            attr = attrs[1];

        // if its a valid number don't use it as a sort attribute
        try {
            Integer.parseInt(attr);
            return Sort.unsorted();
        } catch (NumberFormatException ignored) {
            // ignored
        }

        if (attr.startsWith("^")){
            return Sort.by(Sort.Direction.ASC, attr.substring(1));
        } else {
            return Sort.by(Sort.Direction.DESC, attr);
        }
    }

    private Integer parsePageNumber(String[] attrs) {
        if (attrs.length == 0)
            return 0;
        return Integer.parseInt(attrs[0]);
    }

    private Integer parsePageSize(String[] attrs) {
        if (attrs.length <= 1)
            return pageSize;

        if (attrs.length == 3)
            return Integer.parseInt(attrs[1]);

        try {
            return Integer.parseInt(attrs[1]);
        } catch (NumberFormatException ex) {
            return pageSize;
        }
    }
}`;

    }

    get varName(): string {
        return uncapitalize(PageableConverter.CLASS_NAME);
    }

}
