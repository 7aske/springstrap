export default class Auditable {
	private readonly _domain: string;
	constructor(domain: string) {
		this._domain = domain;
	}

	public get code() {
		return `${this.packageName}

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.EntityListeners;
import javax.persistence.MappedSuperclass;
import java.io.Serializable;
import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class Auditable implements Serializable {

	@LastModifiedDate
	@JsonIgnore
	private LocalDateTime lastModifiedDate;
	@LastModifiedBy
	@JsonIgnore
	private String lastModifiedBy;
	@JsonIgnore
	private Integer recordStatus = 1;
}`;
	}

	public get domain(){
		return this._domain;
	}

	public get packageName(): string {
		if (!this._domain) return "package entity;";
		return `package ${this._domain}.entity;`;
	}
}
