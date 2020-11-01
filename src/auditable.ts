import JavaClass from "./def/JavaClass";
import { uncapitalize } from "./utils";

export default class Auditable extends JavaClass {
	private readonly _className: string;

	constructor(domain: string) {
		super(domain, "entity");
		super.imports = [
			"com.fasterxml.jackson.annotation.JsonIgnore",
			"org.springframework.data.annotation.*",
			"org.springframework.data.jpa.domain.support.AuditingEntityListener",
			"javax.persistence.EntityListeners",
			"javax.persistence.MappedSuperclass",
			"java.io.Serializable",
			"java.time.LocalDateTime",
			"lombok.*"
		];
		super.annotations = [
			"MappedSuperclass",
			"Getter",
			"Setter",
			"EntityListeners(AuditingEntityListener.class)",
			"NoArgsConstructor(access = AccessLevel.PROTECTED)",
		];
		super.interfaces = [
			"Serializable",
		];
		this._className = "Auditable";
	}

	public get className(): string {
		return this._className;
	}

	public get varName(): string {
		return uncapitalize(this._className);
	}

	public get code() {
		const code = `
	@CreatedDate
	@JsonIgnore
	private LocalDateTime createdDate;
	@LastModifiedDate
	@JsonIgnore
	private LocalDateTime lastModifiedDate;
	@LastModifiedBy
	@JsonIgnore
	private String lastModifiedBy;
	@JsonIgnore
	private Integer recordStatus = 1;
`;
		return this.wrap(code);
	}
}
