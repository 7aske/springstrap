# springstrap

## Description

> A utility program to generate a CRUD Spring application just from a DDL dump of a MySql database.

Supports SwaggerV2(for generating Openapi docs), Lombok, JPASpecification, Enums.

## Installation

Assuming linux platform

```bash
npm install # install dependencies
```

```bash
npm run build # build the project
```

```bash
npm run build:install # install the project into /opt
```

## Usage

`springstrap -h`

Generate everything(`-A` - all flag):

`springstrap example.ddl -d com.example.app -A -o ./output_dir`

Generate only the `post` table:

`springstrap example.ddl -d com.example.app -A -o ./output_dir --tables=post`

Generate everything excluding the `user` and `role` tables:

`springstrap example.ddl -d com.example.app -A -o ./output_dir --ignore=user,role`

Generate only entities for the `comment` and `category` tables:

`springstrap example.ddl -d com.example.app -E -o ./output_dir --tables=comment,category`

> When using -p flag for JPASpecification API integration specification classes are not generated. It is assumed that an implementation of those classes along with respective Spring Converter classes exist in the project.

### Enum specification

> This functionality will generate enum classes from an external enum specification file. General use case is when you have varchar fields in a table which you want to represent as enums in code.

Generate structure with enums:

`springstrap example.ddl -d com.example.app -A -o ./output_dir --enums=enums.json`

```json
{
  "enums": [
    {
      "className": "<Output enum class name>", 
      "table": "<List of tables in which enum appears>", 
      "column": "<Column name of the value associated with the enum (must be the same across tables)>", 
      "values": [
        {
          "<Enum name>": "<Enum value>"
        }
      ]
    }
  ]
}
```

#### Example

```json
{
  "enums": [
    {
      "className": "RealEstateStatus",
      "table": "real_estate",
      "column": "status",
      "values": [
        {
          "ACTIVE": "Active"
        },
        {
          "INACTIVE": "Not active"
        },
        {
          "SOLD_RENTED":"Sold/Rented"
        }
      ]
    }
  ]
}
```

## Generated structure

```
src
└── main
    └── java
        └── com
            └── example
                └── yourapp
                    ├── config
                    │   └── Config.java
                    ├── controller
                    │   ├── ...
                    │   └── Controller.java
                    ├── entity
                    │   ├── ...
                    │   └── Entity.java
                    ├── repository
                    │   ├── ...
                    │   └── Repository.java
                    └── service
                        ├── impl
                        │   ├── ...
                        │   └── ServiceImpl.java
                        ├── ...
                        └── Service.java
```

## Bugs

Some MySQL types are not tested and are added as the need arises.

There are probably a lot of bugs, but the basic functionality is there.
