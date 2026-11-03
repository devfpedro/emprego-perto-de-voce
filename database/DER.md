
# Diagrama Entidade-Relacionamento

O diagrama representa as seis tabelas principais do banco de dados Emprego Perto de Você e seus relacionamentos.

```mermaid
erDiagram

    USUARIOS ||--o| CANDIDATOS : possui
    USUARIOS ||--o| EMPRESAS : possui

    LOCALIDADES ||--o{ CANDIDATOS : referencia
    LOCALIDADES ||--o{ EMPRESAS : referencia
    LOCALIDADES ||--o{ VAGAS : referencia

    EMPRESAS ||--o{ VAGAS : publica

    CANDIDATOS ||--o{ CANDIDATURAS : realiza
    VAGAS ||--o{ CANDIDATURAS : recebe

    USUARIOS {
        BIGINT id PK
        VARCHAR nome
        VARCHAR email UK
        VARCHAR senha_hash
        VARCHAR tipo
    }

    LOCALIDADES {
        BIGINT id PK
        VARCHAR cidade
        VARCHAR bairro
        NUMERIC latitude
        NUMERIC longitude
    }

    CANDIDATOS {
        BIGINT id PK
        BIGINT usuario_id FK, UK
        VARCHAR cidade FK
        VARCHAR bairro FK
        VARCHAR area_interesse
        TEXT resumo_profissional
    }

    EMPRESAS {
        BIGINT id PK
        BIGINT usuario_id FK, UK
        VARCHAR nome_fantasia
        TEXT descricao
        VARCHAR cidade FK
        VARCHAR bairro FK
        NUMERIC latitude
        NUMERIC longitude
    }

    VAGAS {
        BIGINT id PK
        BIGINT empresa_id FK
        VARCHAR titulo
        TEXT descricao
        TEXT requisitos
        VARCHAR area
        VARCHAR cidade FK
        VARCHAR bairro FK
        NUMERIC latitude
        NUMERIC longitude
        VARCHAR tipo_contrato
        VARCHAR status
        TIMESTAMPTZ data_criacao
    }

    CANDIDATURAS {
        BIGINT id PK
        BIGINT vaga_id FK
        BIGINT candidato_id FK
        VARCHAR status
        TIMESTAMPTZ data_candidatura
    }
```

## Observações

- `localidades`: possui uma restrição UNIQUE composta por cidade e bairro.
- `candidatos`, `empresas` e `vagas`: utilizam chaves estrangeiras compostas por cidade e bairro para referenciar `localidades`.
- `usuario_id` é único em candidatos e empresas, permitindo no máximo um perfil de cada tipo por usuário.