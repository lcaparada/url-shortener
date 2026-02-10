# URL Shortener

API para encurtamento de URLs: cria códigos curtos para URLs longas e redireciona acessos para a URL original. Projeto em **Node.js + TypeScript** com arquitetura em camadas, cache em Redis e documentação OpenAPI.

---

## O que o projeto faz

- **Criar short URL**: envia uma URL original e recebe um `shortCode` (ex.: `aB3xY9kL`).
- **Redirecionar**: ao acessar `GET /:shortCode`, o usuário é redirecionado (302) para a URL original.
- **Métricas**: cada redirecionamento incrementa um contador de cliques no banco.
- **Performance**: cache em Redis para reduzir consultas ao banco em redirecionamentos frequentes.

---

## Stack e tecnologias

| Área | Tecnologia |
|------|------------|
| **Runtime** | Node.js |
| **Linguagem** | TypeScript |
| **Framework HTTP** | Fastify |
| **Banco de dados** | PostgreSQL (Prisma ORM) |
| **Cache** | Redis (ioredis) |
| **Validação** | Zod (integração com Fastify) |
| **Documentação API** | Swagger / OpenAPI 3 |
| **Testes** | Jest (unitários), k6 (testes de carga) |
| **IDs** | ULID (entidades), short codes aleatórios (8 caracteres, base62) |

---

## Arquitetura

O código segue **Clean Architecture** (ou “hexagonal”), separando regras de negócio da infraestrutura:

```
src/
├── domain/           # Regras de negócio e contratos
│   ├── entities/     # Entidades (ShortUrl, Entity base)
│   ├── errors/       # Erros de domínio (NotFound, Database)
│   ├── repositories/ # Interface do repositório
│   ├── cache/        # Interface do cache
│   └── generators/   # Interface do gerador de short code
├── application/      # Casos de uso (orquestração)
│   └── useCases/
│       └── shortUrls/
│           ├── create-short-url.use-case.ts
│           └── get-original-url-by-short-code.use-case.ts
├── infra/            # Implementações concretas
│   ├── database/     # Prisma client
│   ├── repositories/ # ShortUrlsRepository (Prisma)
│   ├── cache/        # ShortUrlRedisCache (Redis)
│   └── generators/   # ShortCodeGenerator (crypto random, base62)
├── presentation/     # HTTP (Fastify)
│   ├── controllers/
│   ├── routes/
│   └── errors/       # errorHandler global
└── main/             # Composição (DI)
    └── composition/  # makeShortUrlsController, wiring de dependências
```

- **Domain**: não depende de framework nem de banco; apenas interfaces e entidades.
- **Application**: use cases que dependem das interfaces (repositório, cache, gerador).
- **Infra**: implementações (Prisma, Redis, gerador com `crypto.randomBytes`).
- **Presentation**: rotas Fastify, controller, validação Zod e tratamento de erros.
- **Main**: monta o controller injetando repositório, cache e gerador.

---

## O que foi implementado

### Funcionalidades

1. **POST /short-urls**  
   - Body: `{ "originalUrl": "https://..." }` (validado com `z.url()`).  
   - Cria entidade com `shortCode` único (8 caracteres), persiste no PostgreSQL e retorna `{ shortCode }` com status 201.

2. **GET /:shortCode**  
   - Busca a URL original (cache Redis → fallback no repositório).  
   - Incrementa cliques no banco.  
   - Redireciona 302 para a URL original (apenas `http://` ou `https://`).  
   - Retorna 404 se o short code não existir.

3. **Cache em Redis**  
   - Após buscar do banco, o par `shortCode → originalUrl` é armazenado no Redis com TTL de 1 hora.  
   - Leituras subsequentes usam o cache, reduzindo carga no Postgres em cenários de muitos redirects.

4. **Rate limiting**  
   - `@fastify/rate-limit`: limite configurável por minuto (env `RATE_LIMIT_MAX`, padrão 100).  
   - Pode ser desativado com `RATE_LIMIT_MAX=0` (útil para load test).

5. **Documentação da API**  
   - Swagger/OpenAPI em `/docs` (`@fastify/swagger` + `@fastify/swagger-ui`).

6. **Tratamento de erros**  
   - Handler global: `NotFoundError` → 404, `DatabaseError` → 500, mensagens genéricas em produção.

7. **Logging**  
   - Pino com saída formatada (pino-pretty) em desenvolvimento.

### Qualidade e confiabilidade

- **Testes unitários** com Jest (domain, use cases, repositório, cache, controller, gerador).
- **Cobertura de código** habilitada (Jest `collectCoverage: true`).
- **Testes de carga** com k6:
  - `scripts/load-test.js`: criação de short URL + redirect (100 VUs, 30s).
  - `scripts/redirect-load-test.js`: foco em redirects (50 VUs, 30s), útil para comparar desempenho com e sem Redis.

### Infraestrutura

- **PostgreSQL**: modelo Prisma com tabela `short_urls` (id, original_url, short_code, created_at, clicks).
- **Redis**: Docker Compose para desenvolvimento; variável `REDIS_URL` para conexão.
- **Prisma**: migrations e scripts `db:generate`, `db:push`, `db:migrate`, `db:studio`.

---

## Como rodar o projeto

### Pré-requisitos

- Node.js (recomendado LTS)
- PostgreSQL (acessível por URL em `DATABASE_URL`)
- Redis (local ou via `docker compose`)

### Variáveis de ambiente

Crie um `.env` na raiz (ou use os valores abaixo como referência):

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/url_shortener"
REDIS_URL="redis://localhost:6379"
RATE_LIMIT_MAX=100
```

- `RATE_LIMIT_MAX=0` desativa o rate limit (útil para testes de carga).

### Comandos

```bash
# Instalar dependências
npm install

# Subir Redis (Docker)
npm run redis:up

# Gerar cliente Prisma e aplicar schema no banco
npm run db:generate
npm run db:push
# ou, se usar migrations: npm run db:migrate

# Desenvolvimento (watch)
npm run dev

# Testes unitários
npm test

# Testes de carga (k6 instalado)
npm run load-test
npm run load-test:redirect
```

A API fica em `http://localhost:3000` e a documentação em **http://localhost:3000/docs**.

---

## Endpoints resumidos

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/short-urls` | Cria short URL; body: `{ "originalUrl": "https://..." }` → `{ "shortCode": "..." }` |
| GET | `/:shortCode` | Redireciona (302) para a URL original ou 404 |

Respostas de erro seguem formato `{ statusCode, error, message }`.

---

## Decisões técnicas (resumo para o recruiter)

- **Clean Architecture**: domínio e casos de uso isolados; troca de banco ou cache sem alterar regras de negócio.
- **Fastify**: desempenho e ecossistema (rate-limit, swagger, zod).
- **Short code**: 8 caracteres em base62 (`a–z`, `A–Z`, `0–9`), gerados com `crypto.randomBytes` para evitar colisões e previsibilidade.
- **ULID** para IDs internos das entidades (ordenáveis e únicos).
- **Redis** como cache de leitura para redirects, com TTL e fallback gracioso se o Redis falhar.
- **Zod** para validação e tipagem dos schemas da API.
- **Jest** para testes unitários e **k6** para testes de carga, com scripts prontos para comparar cenários com e sem cache.

---

## Resumo para o tech recruiter

Este repositório é um **projeto de encurtador de URLs** em Node.js/TypeScript que demonstra:

- Uso de **arquitetura em camadas** (domain, application, infra, presentation) e injeção de dependências.
- Stack moderna: **Fastify**, **Prisma**, **PostgreSQL**, **Redis**, **Zod**, **Swagger**.
- Boas práticas: **testes unitários** (Jest), **testes de carga** (k6), **documentação OpenAPI**, **rate limiting** e **tratamento de erros** centralizado.
- Foco em **performance** (cache em Redis para redirects) e **manutenibilidade** (interfaces no domínio, use cases isolados).

O projeto está pronto para ser executado localmente com Node, Postgres e Redis (incluindo Redis via Docker), e os scripts de load test permitem validar o comportamento sob carga.
