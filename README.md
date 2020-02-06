# springstrap

## Description

Utility program to generate a CRUD Spring application just from a DDL dump of a MySql database.

## Usage

`ss -d com.example.app -o ./output_dir`

`npm start` will run the program on the database in example folder.


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
                        ├── ...
                        └── Service.java
```

## Bugs

There are probably a lot of bugs but the basic functionality is there. ManyToMany relationships are not yet tested.
