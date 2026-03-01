# eCommerceShopWatch - Mikroservisna arhitektura

Ecommerce aplikacija za satove i nakit transformisana u mikroservisnu arhitekturu sa kompletnim DevOps workflow-om.

**Student:** Anastasija Beric | **Predmet:** Integracije (IROIT), FTN Novi Sad

---

## Arhitektura

```
React Native Frontend
        |
  API Gateway (:3000)
  /    |    |    \
user  prod  order  notif
:3001 :3002 :3003  :3004
  |     |     |      |
 PG    PG    PG   RabbitMQ
```

**5 NestJS mikroservisa** + PostgreSQL + RabbitMQ + Prometheus + Grafana

### Tipovi komunikacije
- REST API (sinhrona komunikacija gateway ↔ servisi)
- RabbitMQ (asinhrona: order-service → notification-service)
- SSE - Server-Sent Events (reaktivna: live update statusa porudzbina)

---

## Pokretanje

```bash
docker compose up --build -d
```

| Servis | URL |
|--------|-----|
| API Gateway | http://localhost:3000 |
| user-service | http://localhost:3001 |
| product-service | http://localhost:3002 |
| order-service | http://localhost:3003 |
| notification-service | http://localhost:3004 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3100 |
| RabbitMQ UI | http://localhost:15672 |

---

## Struktura

```
ecommerceShopWatch/
├── .github/workflows/    # CI/CD pipelines
├── services/
│   ├── api-gateway/      # Rutiranje i proxy (:3000)
│   ├── user-service/     # Auth i korisnici (:3001)
│   ├── product-service/  # Proizvodi (:3002)
│   ├── order-service/    # Porudzbine + SSE (:3003)
│   └── notification-service/ # RabbitMQ consumer (:3004)
├── frontend/             # React Native Expo app
├── monitoring/           # Prometheus + Grafana config
└── docker-compose.yml
```

---

## Testiranje

```bash
cd services/user-service && npm test
cd services/product-service && npm test
cd services/order-service && npm test
```

## Staticka analiza

```bash
cd services/user-service && npm run lint
```
